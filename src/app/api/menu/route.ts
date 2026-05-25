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

// gemini-1.5-flash está retirado en v1beta. 2.5-flash es su equivalente actual
// (mismo tier de coste/latencia). Cambia a "gemini-flash-latest" si prefieres
// que rastree automáticamente la versión vigente.
const MODEL = "gemini-2.5-flash";

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

// Sección obligatoria con los alimentos que cada miembro no quiere comer.
const dislikesBlock = (members: Member[]): string => {
  const withDislikes = members.filter(
    (m) => m.dislikes && m.dislikes.trim() !== "",
  );
  if (withDislikes.length === 0) return "";
  const lines = withDislikes.map(
    (m) => `- ${m.name}: NO usar nunca → ${m.dislikes.trim()}`,
  );
  return `\nIMPORTANTE - Alimentos a evitar (no son alergias pero debes evitarlos completamente en el menú):\n${lines.join("\n")}\n\nEsto es obligatorio. Si un miembro no quiere brócoli, no puede aparecer brócoli en ningún plato de la semana, ni como ingrediente secundario ni como guarnición.\n`;
};

const NUTRITIONAL_RULES = `Reglas nutricionales (aplícalas estrictamente):
- Alterna proteína animal y vegetal a lo largo de la semana.
- Máximo 2 días seguidos con la misma proteína principal.
- Mínimo 3 cenas ligeras por semana (sopas, ensaladas, cremas, tortillas).
- Mínimo 2 comidas con legumbres por semana.
- Mínimo 3 comidas con verdura como base.
- Mínimo 1 comida con pescado por semana (omítela solo si hay restricción de pescado o marisco).
- Como mucho 2 platos fritos a la semana.
- Las cenas deben ser más ligeras que las comidas (menos calorías y menos grasa).
- En "nutrientes", "calorias_aprox" debe ser un entero con la estimación realista por ración.`;

const COMMON_RULES = `Reglas estrictas:
1. Respeta TODAS las restricciones alimentarias de cada miembro.
2. Para cada plato, "apto": true si todos pueden comerlo tal cual; false si algún miembro necesita adaptación.
3. Si "apto" es false, "adaptacion" describe brevemente la variante (ej. "Versión sin gluten para Lucía"). Si es true, "adaptacion" debe ser cadena vacía "".
4. "cocinero" son las iniciales en mayúsculas (2 letras) del adulto que cocina ese día, priorizando los adultos disponibles ese día. Si nadie está disponible, elige cualquier adulto.
5. Para cada plato incluye los ingredientes con cantidades exactas: cantidad numérica, unidad (g, kg, ml, l, ud, bote, paquete, manojo) y categoría (carnes, verduras, lacteos, despensa, otros).
6. "tiempo" en minutos, entero. Comidas: 25–50 min. Cenas: 15–30 min.

IMPORTANTE sobre ingredientes:
- NO incluyas ingredientes básicos de despensa que todo el mundo tiene: sal, pimienta, aceite de oliva, aceite, agua, azúcar, vinagre, ajo en polvo, papel de cocina, papel film, bicarbonato, levadura química, colorante.
- NO incluyas en los ingredientes de ningún plato: sal, pimienta, aceite, aceite de oliva, agua, azúcar, vinagre, especias básicas en polvo, papel de horno. Estas cosas las tiene todo el mundo en casa.
- SÍ incluye: ajo fresco, cebolla, especias específicas poco comunes, caldos, salsas específicas.
- Usa el mismo nombre (en singular) para un ingrediente que se repita en varios platos, para poder consolidarlo en la lista de la compra.`;

const favoritesBlock = (favoritos: string[]): string =>
  favoritos.length > 0
    ? `\nEstos son los platos favoritos de la familia, intenta incluir al menos 2-3 de ellos en el menú semanal (adaptándolos a las restricciones si hace falta):\n${favoritos.map((f) => `- ${f}`).join("\n")}\n`
    : "";

const buildWeekPrompt = (members: Member[], favoritos: string[]) => `Eres un planificador de comidas familiar. Diseña un menú semanal con COMIDA y CENA para cada día (Lunes a Domingo). 14 platos en total.

Familia:
${familyToPrompt(members)}
${dislikesBlock(members)}${favoritesBlock(favoritos)}
${COMMON_RULES}
7. "dia" debe ser exactamente uno de: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo, en ese orden.
8. Devuelve el array "semana" con los 7 días en orden.

${NUTRITIONAL_RULES}

Responde SOLO con JSON válido conforme al esquema indicado.`;

const buildDayPrompt = (
  members: Member[],
  dia: SpanishDay,
  platosExistentes: string[],
  favoritos: string[],
) => {
  const existing =
    platosExistentes.length > 0
      ? `\nPlatos ya presentes en el resto de la semana (NO los repitas y busca opciones claramente distintas en proteína y técnica):\n${platosExistentes.map((p) => `- ${p}`).join("\n")}\n`
      : "";
  return `Eres un planificador de comidas familiar. Diseña UNA comida y UNA cena para el día ${dia}. Devuelve la estructura "semana" con un único elemento cuyo "dia" sea exactamente "${dia}".

Familia:
${familyToPrompt(members)}
${dislikesBlock(members)}${existing}${favoritesBlock(favoritos)}
${COMMON_RULES}
7. "dia" debe ser exactamente "${dia}".
8. Devuelve un array "semana" con UN único elemento.

${NUTRITIONAL_RULES}

Responde SOLO con JSON válido conforme al esquema indicado.`;
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
    const result = await model.generateContent(prompt);
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
    const message =
      err instanceof Error ? err.message : "Error desconocido al llamar a Gemini";
    console.error("[/api/menu] Gemini error:", err);
    return Response.json(
      { error: `Gemini no devolvió un menú válido: ${message}` },
      { status: 502 },
    );
  }
}
