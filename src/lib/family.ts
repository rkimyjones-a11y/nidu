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

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
};

export const SAMPLE_FAMILY: Member[] = [
  {
    id: "f-1",
    name: "María",
    age: "adulto",
    restrictions: ["sin lactosa"],
    cookingDays: ["L", "X", "V", "D"],
  },
  {
    id: "f-2",
    name: "Carlos",
    age: "adulto",
    restrictions: ["sin alergias"],
    cookingDays: ["M", "J", "S"],
  },
  {
    id: "f-3",
    name: "Lucía",
    age: "niño",
    restrictions: ["sin gluten"],
    cookingDays: [],
  },
];
