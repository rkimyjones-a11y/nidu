export type Age = "adulto" | "niño";

export const RESTRICTIONS = [
  "sin gluten",
  "sin lactosa",
  "vegetariano",
  "vegano",
  "sin frutos secos",
  "sin mariscos",
  "sin huevo",
  "halal",
  "kosher",
  "dieta mediterránea",
  "sin cerdo",
  "sin alergias",
] as const;
export type Restriction = (typeof RESTRICTIONS)[number];

// Marcar "vegano" implica deseleccionar estas opciones (y viceversa).
export const VEGANO_INCOMPATIBLE: readonly Restriction[] = [
  "vegetariano",
  "sin lactosa",
  "sin huevo",
];

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

export const FAMILY_STORAGE_KEY = "nidu_familia";

const isValidMember = (m: unknown): m is Member => {
  if (!m || typeof m !== "object") return false;
  const v = m as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    (v.age === "adulto" || v.age === "niño") &&
    Array.isArray(v.restrictions) &&
    Array.isArray(v.cookingDays)
  );
};

export const readFamily = (): Member[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FAMILY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isValidMember);
  } catch {
    return null;
  }
};

export const writeFamily = (members: Member[]): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(members));
  } catch {
    // quota exceeded or storage disabled — non-fatal
  }
};
