import { INGREDIENTES_BASICOS } from "@/lib/ingredientesBasicos";

export type Category =
  | "carnes"
  | "verduras"
  | "lacteos"
  | "despensa"
  | "otros";

export type Unit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "ud"
  | "bote"
  | "paquete"
  | "manojo";

export type Ingredient = {
  name: string;
  amount: number;
  unit: Unit;
  category: Category;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  carnes: "Carnes y pescados",
  verduras: "Verduras y frutas",
  lacteos: "Lácteos y huevos",
  despensa: "Pasta, arroz y legumbres",
  otros: "Otros",
};

export const CATEGORY_ORDER: Category[] = [
  "carnes",
  "verduras",
  "lacteos",
  "despensa",
  "otros",
];

export const CATEGORY_EMOJI: Record<Category, string> = {
  carnes: "🥩",
  verduras: "🥬",
  lacteos: "🥛",
  despensa: "🍝",
  otros: "🧂",
};

export const ingredientKey = (ing: Pick<Ingredient, "name" | "unit">) =>
  `${ing.name.toLowerCase()}__${ing.unit}`;

// Normaliza un nombre de ingrediente para poder comparar/agrupar:
// minúsculas, sin tildes, sin espacios extra y sin la 's' final (plural).
export const normalizarNombre = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/s$/, "");

const BASICOS_NORM = new Set(INGREDIENTES_BASICOS.map(normalizarNombre));

// ¿Es un ingrediente básico de despensa que no va a la lista de la compra?
export const esIngredienteBasico = (name: string): boolean => {
  const norm = normalizarNombre(name);
  if (BASICOS_NORM.has(norm)) return true;
  // "aceite de oliva virgen extra" empieza por "aceite de oliva ", etc.
  for (const basico of BASICOS_NORM) {
    if (norm.startsWith(basico + " ")) return true;
  }
  return false;
};

const capitalizar = (s: string): string =>
  s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);

// Consolida los ingredientes de todos los platos para la lista de la compra:
// 1) descarta los básicos de despensa,
// 2) normaliza los nombres (singular/plural, tildes, espacios),
// 3) agrupa por nombre normalizado + unidad sumando cantidades; unidades
//    distintas del mismo ingrediente quedan como entradas separadas.
export const consolidarIngredientes = (
  source: { ingredients: Ingredient[] }[],
): Ingredient[] => {
  const byKey = new Map<string, Ingredient>();
  for (const item of source) {
    for (const ing of item.ingredients) {
      if (esIngredienteBasico(ing.name)) continue;
      const norm = normalizarNombre(ing.name);
      if (norm === "") continue;
      const key = `${norm}__${ing.unit}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.amount += ing.amount;
      } else {
        byKey.set(key, {
          name: capitalizar(norm),
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
        });
      }
    }
  }
  return Array.from(byKey.values());
};

const PLURAL_UNITS: Partial<Record<Unit, string>> = {
  ud: "uds",
  bote: "botes",
  paquete: "paquetes",
  manojo: "manojos",
};

export const formatQuantity = (ing: Ingredient): string => {
  const plural = PLURAL_UNITS[ing.unit];
  if (plural) {
    return `${ing.amount} ${ing.amount === 1 ? ing.unit : plural}`;
  }
  return `${ing.amount} ${ing.unit}`;
};

export const formatWeekSentence = (monday: Date, sunday: Date): string => {
  const dayFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric" });
  const monthFmt = new Intl.DateTimeFormat("es-ES", { month: "long" });
  const startDay = dayFmt.format(monday);
  const endDay = dayFmt.format(sunday);
  const startMonth = monthFmt.format(monday);
  const endMonth = monthFmt.format(sunday);
  return startMonth === endMonth
    ? `Semana del ${startDay} al ${endDay} de ${endMonth}`
    : `Semana del ${startDay} de ${startMonth} al ${endDay} de ${endMonth}`;
};
