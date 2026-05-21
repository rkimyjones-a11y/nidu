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

export const aggregateIngredients = (
  source: { ingredients: Ingredient[] }[],
): Ingredient[] => {
  const byKey = new Map<string, Ingredient>();
  for (const item of source) {
    for (const ing of item.ingredients) {
      const key = ingredientKey(ing);
      const existing = byKey.get(key);
      if (existing) {
        existing.amount += ing.amount;
      } else {
        byKey.set(key, { ...ing });
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
