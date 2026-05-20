export type Age = "adulto" | "niño";

export const RESTRICTIONS = [
  "sin gluten",
  "vegetariano",
  "sin lactosa",
  "sin alergias",
] as const;
export type Restriction = (typeof RESTRICTIONS)[number];

export const DAYS = ["L", "M", "X", "J", "V", "S", "D"] as const;
export type Day = (typeof DAYS)[number];

export const DAY_LABELS: Record<Day, string> = {
  L: "Lun",
  M: "Mar",
  X: "Mié",
  J: "Jue",
  V: "Vie",
  S: "Sáb",
  D: "Dom",
};

export type Member = {
  id: string;
  name: string;
  age: Age;
  restrictions: Restriction[];
  cookingDays: Day[];
};
