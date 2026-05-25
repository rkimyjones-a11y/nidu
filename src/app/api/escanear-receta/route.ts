import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// gemini-1.5-flash está retirado en v1beta; 2.5-flash es su equivalente actual
// y soporta entrada de imagen (multimodal).
const MODEL = "gemini-2.5-flash";

const CATEGORIAS = [
  "Carne",
  "Pescado",
  "Vegetariano",
  "Pasta",
  "Legumbres",
  "Otro",
];

const PROMPT = `Analiza esta imagen de una receta de cocina y extrae la información.
Responde SOLO en JSON con esta estructura exacta:
{
  "nombre": "Nombre del plato",
  "tiempo": 30,
  "categoria": "Carne|Pescado|Vegetariano|Pasta|Legumbres|Otro",
  "ingredientes": [
    {"nombre": "Pollo", "cantidad": "500g"},
    {"nombre": "Cebolla", "cantidad": "2 uds"}
  ],
  "notas": "Instrucciones breves de preparación en máximo 3 líneas"
}
Si no puedes leer algún campo, usa null.
Si la imagen no es una receta de cocina, devuelve {"error": "No es una receta"}`;

type RawIngrediente = { nombre?: unknown; cantidad?: unknown };

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY no está configurada en el servidor" },
      { status: 500 },
    );
  }

  let body: { imageBase64?: unknown; mimeType?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const imageBase64 =
    typeof body.imageBase64 === "string" ? body.imageBase64 : "";
  const mimeType =
    typeof body.mimeType === "string" ? body.mimeType : "image/jpeg";

  if (!imageBase64) {
    return Response.json({ error: "Falta la imagen" }, { status: 400 });
  }
  if (!mimeType.startsWith("image/")) {
    return Response.json(
      { error: "El archivo no es una imagen" },
      { status: 400 },
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  try {
    const result = await model.generateContent([
      PROMPT,
      { inlineData: { data: imageBase64, mimeType } },
    ]);
    const text = result.response.text();
    const parsed = JSON.parse(text) as Record<string, unknown>;

    if (typeof parsed.error === "string") {
      return Response.json({ error: parsed.error }, { status: 200 });
    }

    // Normaliza la salida del modelo a la forma que espera el cliente.
    const categoriaRaw =
      typeof parsed.categoria === "string" ? parsed.categoria : "Otro";
    const categoria = CATEGORIAS.includes(categoriaRaw) ? categoriaRaw : "Otro";

    const tiempo =
      typeof parsed.tiempo === "number" && Number.isFinite(parsed.tiempo)
        ? Math.round(parsed.tiempo)
        : null;

    const ingredientes = Array.isArray(parsed.ingredientes)
      ? (parsed.ingredientes as RawIngrediente[])
          .map((i) => ({
            nombre: typeof i?.nombre === "string" ? i.nombre : "",
            cantidad: typeof i?.cantidad === "string" ? i.cantidad : "",
          }))
          .filter((i) => i.nombre.trim() !== "")
      : [];

    const receta = {
      nombre: typeof parsed.nombre === "string" ? parsed.nombre : "",
      tiempo,
      categoria,
      ingredientes,
      notas: typeof parsed.notas === "string" ? parsed.notas : "",
    };

    return Response.json({ receta }, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al analizar";
    console.error("[/api/escanear-receta] Gemini error:", err);
    return Response.json(
      { error: `No hemos podido analizar la imagen: ${message}` },
      { status: 502 },
    );
  }
}
