import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Member } from "@/lib/family";
import { DAY_LABELS } from "@/lib/family";
import { getFavoritos, saveMenu } from "@/lib/db";
import {
  SPANISH_DAYS,
  getWeekRange,
  toISODate,
  type MenuResponse,
  type SpanishDay,
} from "@/lib/menuApi";

export const runtime = "nodejs";

// gemini-1.5-flash está retirado en v1beta. Usamos 2.5-flash-lite: línea
// "lite" optimizada para baja latencia, con cuota separada del flash normal
// → menos 503 por saturación y respuestas más rápidas.
const MODEL = "gemini-2.5-flash-lite";

// Reintentos automáticos ante errores transitorios de Gemini.
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 2000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRetryableError = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /\[\s*(503|429)/.test(msg) ||
    /overload|unavailable|exhausted|quota|temporarily/i.test(msg)
  );
};

const callWithRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === RETRY_ATTEMPTS || !isRetryableError(err)) throw err;
      const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1); // 2s, 4s
      console.warn(
        `[/api/menu] reintento ${attempt}/${RETRY_ATTEMPTS} en ${delay}ms — ${err instanceof Error ? err.message : err}`,
      );
      await sleep(delay);
    }
  }
  throw lastErr;
};

const nutrientesSchema = {
  type: SchemaType.OBJECT,
  properties: {
    proteina: {
      type: SchemaType.STRING,
      enum: ["alta", "media", "baja"],
    },
    carbohidratos: {
      type: SchemaType.STRING,
      enum: ["alto", "medio", "bajo"],
    },
    grasas: {
      type: SchemaType.STRING,
      enum: ["alta", "media", "baja"],
    },
    calorias_aprox: { type: SchemaType.INTEGER },
  },
  required: ["proteina", "carbohidratos", "grasas", "calorias_aprox"],
} as const;

const dishSchema = {
  type: SchemaType.OBJECT,
  properties: {
    nombre: { type: SchemaType.STRING },
    tiempo: { type: SchemaType.INTEGER },
    apto: { type: SchemaType.BOOLEAN },
    adaptacion: { type: SchemaType.STRING },
    cocinero: { type: SchemaType.STRING },
    ingredientes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          nombre: { type: SchemaType.STRING },
          cantidad: { type: SchemaType.NUMBER },
          unidad: {
            type: SchemaType.STRING,
            enum: ["g", "kg", "ml", "l", "ud", "bote", "paquete", "manojo"],
          },
          categoria: {
            type: SchemaType.STRING,
            enum: ["carnes", "verduras", "lacteos", "despensa", "otros"],
          },
        },
        required: ["nombre", "cantidad", "unidad", "categoria"],
      },
    },
    nutrientes: nutrientesSchema,
  },
  required: [
    "nombre",
    "tiempo",
    "apto",
    "adaptacion",
    "cocinero",
    "ingredientes",
    "nutrientes",
  ],
} as const;

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    semana: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          dia: { type: SchemaType.STRING },
          comida: dishSchema,
          cena: dishSchema,
        },
        required: ["dia", "comida", "cena"],
      },
    },
  },
  required: ["semana"],
} as const;

const familyToPrompt = (members: Member[]): string => {
  const lines = members.map((m) => {
    const role = m.age === "adulto" ? "adulto" : "niño/a";
    const restrictions =
      m.restrictions.length > 0 ? m.restrictions.join(", ") : "ninguna";
    const cooks =
      m.age === "adulto"
        ? m.cookingDays.length > 0
          ? m.cookingDays.map((d) => DAY_LABELS[d]).join(", ")
          : "ningún día"
        : "no cocina";
    const dislikes =
      m.dislikes && m.dislikes.trim() !== "" ? m.dislikes.trim() : "—";
    return `- ${m.name} (${role}); restricciones: ${restrictions}; no le gusta: ${dislikes}; cocina: ${cooks}`;
  });
  return lines.join("\n");
};

const dislikesBlock = (members: Member[]): string => {
  const withDislikes = members.filter((m) => m.dislikes?.trim());
  if (withDislikes.length === 0) return "";
  const lines = withDislikes.map(
    (m) => `- ${m.name}: NUNCA → ${m.dislikes.trim()}`,
  );
  return `\nAlimentos a EVITAR completamente (ni como guarnición):\n${lines.join("\n")}\n`;
};

const NUTRITIONAL_RULES = `Reglas nutricionales:
- Alterna proteína animal y vegetal; máx. 2 días seguidos con la misma.
- Mín. 3 cenas ligeras (sopas, cremas, ensaladas, tortilla).
- Mín. 2 comidas con legumbres y 3 con verdura como base.
- Mín. 1 comida con pescado (omite si hay restricción).
- Máx. 2 fritos por semana. Cenas más ligeras que comidas.`;

const COMMON_RULES = `Reglas:
1. Respeta TODAS las restricciones de cada miembro.
2. "apto": true si todos pueden comerlo tal cual; false si necesita adaptación, y "adaptacion" describe la variante. Si true, "adaptacion": "".
3. "cocinero": 2 iniciales del adulto que cocina ese día, priorizando disponibles; si nadie, cualquier adulto.
4. Ingredientes con cantidad numérica, unidad (g, kg, ml, l, ud, bote, paquete, manojo) y categoría (carnes, verduras, lacteos, despensa, otros).
5. Tiempo en minutos. Comidas 25–50, cenas 15–30.
6. NO incluyas estos ingredientes (los tenemos todos): sal, pimienta, aceite, agua, azúcar, vinagre, especias básicas en polvo, papel film/horno, bicarbonato, levadura.
7. Usa nombre singular y mismo para ingredientes repetidos (zanahoria, no zanahorias).`;

const favoritesBlock = (favoritos: string[]): string =>
  favoritos.length === 0
    ? ""
    : `\nFavoritos de la familia (incluye 2-3, adaptados si hace falta):\n${favoritos.map((f) => `- ${f}`).join("\n")}\n`;

const buildWeekPrompt = (members: Member[], favoritos: string[]) =>
  `Diseña un menú semanal: comida y cena de Lunes a Domingo (14 platos).

Familia:
${familyToPrompt(members)}
${dislikesBlock(members)}${favoritesBlock(favoritos)}
${COMMON_RULES}
8. "dia" debe ser uno de: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo, en orden.

${NUTRITIONAL_RULES}

Devuelve JSON conforme al esquema.`;

const buildDayPrompt = (
  members: Member[],
  dia: SpanishDay,
  platosExistentes: string[],
  favoritos: string[],
) => {
  const existing =
    platosExistentes.length === 0
      ? ""
      : `\nNO repitas estos platos ya en la semana (busca alternativas distintas):\n${platosExistentes.map((p) => `- ${p}`).join("\n")}\n`;
  return `Diseña UNA comida y UNA cena para el ${dia}.

Familia:
${familyToPrompt(members)}
${dislikesBlock(members)}${existing}${favoritesBlock(favoritos)}
${COMMON_RULES}
8. "dia" debe ser exactamente "${dia}". Devuelve "semana" con UN único elemento.

${NUTRITIONAL_RULES}

Devuelve JSON conforme al esquema.`;
};

const isValidMember = (m: unknown): m is Member => {
  if (!m || typeof m !== "object") return false;
  const v = m as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    (v.age === "adulto" || v.age === "niño") &&
    Array.isArray(v.restrictions) &&
    Array.isArray(v.cookingDays)
  );
};

const isSpanishDay = (v: unknown): v is SpanishDay =>
  typeof v === "string" && (SPANISH_DAYS as readonly string[]).includes(v);

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY no está configurada en el servidor" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const members = body.members;
  if (!Array.isArray(members) || members.length === 0) {
    return Response.json(
      { error: "Se requiere al menos un miembro de la familia" },
      { status: 400 },
    );
  }
  if (!members.every(isValidMember)) {
    return Response.json(
      { error: "Formato de miembros inválido" },
      { status: 400 },
    );
  }

  const modo = body.modo === "dia" ? "dia" : "semana";
  const familiaId =
    typeof body.familia_id === "string" ? body.familia_id : null;

  // Cargar favoritos de la familia (best-effort) para sesgar el menú.
  let favoritos: string[] = [];
  if (familiaId) {
    try {
      favoritos = (await getFavoritos(familiaId)).map((f) => f.nombre);
    } catch (err) {
      console.error("[/api/menu] No se pudieron cargar favoritos:", err);
    }
  }

  let prompt: string;
  if (modo === "dia") {
    const dia = body.dia;
    if (!isSpanishDay(dia)) {
      return Response.json(
        { error: "Falta o es inválido el campo 'dia'" },
        { status: 400 },
      );
    }
    const platosExistentes = Array.isArray(body.platosExistentes)
      ? (body.platosExistentes as unknown[]).filter(
          (s): s is string => typeof s === "string",
        )
      : [];
    prompt = buildDayPrompt(members, dia, platosExistentes, favoritos);
  } else {
    prompt = buildWeekPrompt(members, favoritos);
  }

  // Log del prompt completo para poder verificarlo en la consola del servidor.
  console.log(
    `\n===== [/api/menu] PROMPT (modo: ${modo}) =====\n${prompt}\n===== FIN PROMPT =====\n`,
  );

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema as never,
      temperature: 1.0,
    },
  });

  try {
    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text();
    const parsed = JSON.parse(text) as unknown;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as { semana?: unknown }).semana)
    ) {
      throw new Error("Respuesta sin campo 'semana'");
    }

    const data = parsed as {
      semana: Array<{
        dia: string;
        comida: { adaptacion: string };
        cena: { adaptacion: string };
      }>;
    };

    // En modo "dia" forzamos el nombre del día por si el modelo varía la
    // capitalización o acentos, y nos quedamos con un único elemento.
    if (modo === "dia" && data.semana.length > 0) {
      data.semana[0]!.dia = body.dia as string;
      data.semana = [data.semana[0]!];
    }

    // Normaliza "adaptacion": "" → null (más cómodo en cliente)
    for (const day of data.semana) {
      for (const meal of [day.comida, day.cena]) {
        if (
          typeof meal.adaptacion === "string" &&
          meal.adaptacion.trim() === ""
        ) {
          (meal as unknown as { adaptacion: string | null }).adaptacion = null;
        }
      }
    }

    // Persistir el menú semanal completo (best-effort, no bloquea la respuesta).
    if (modo === "semana" && familiaId) {
      const semanaInicio = toISODate(getWeekRange(new Date()).monday);
      try {
        await saveMenu(familiaId, semanaInicio, data as unknown as MenuResponse);
      } catch (err) {
        console.error("[/api/menu] No se pudo guardar el menú:", err);
      }
    }

    return Response.json(data);
  } catch (err) {
    console.error("[/api/menu] Gemini error:", err);
    if (isRetryableError(err)) {
      return Response.json(
        {
          error:
            "El servicio de IA está saturado ahora mismo. Espera unos segundos y vuelve a intentarlo.",
        },
        { status: 503 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Error desconocido al llamar a Gemini";
    return Response.json(
      { error: `Gemini no devolvió un menú válido: ${message}` },
      { status: 502 },
    );
  }
}
