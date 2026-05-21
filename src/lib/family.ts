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
  "sin cerdo",
  "sin alergias",
] as const;
export type Restriction = (typeof RESTRICTIONS)[number];

// Marcar "vegano" implica deseleccionar estas opciones (y viceversa).
export const VEGANO_INCOMPATIBLE: readonly Restriction[] = [
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
  dislikes: string;
};

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
};

// Aplica las reglas de exclusión al alternar una restricción.
export const toggleRestriction = (
  current: Restriction[],
  r: Restriction,
): Restriction[] => {
  // "Sin alergias" es exclusiva con todo lo demás
  if (r === "sin alergias") {
    return current.includes(r) ? [] : [r];
  }
  let next = current.filter((x) => x !== "sin alergias");

  // "Vegano" excluye sin lactosa / sin huevo (redundantes)
  if (r === "vegano") {
    if (next.includes("vegano")) {
      return next.filter((x) => x !== "vegano");
    }
    return [...next.filter((x) => !VEGANO_INCOMPATIBLE.includes(x)), "vegano"];
  }

  // Activar sin lactosa / sin huevo retira "vegano"
  if (VEGANO_INCOMPATIBLE.includes(r)) {
    next = next.filter((x) => x !== "vegano");
  }

  return next.includes(r)
    ? next.filter((x) => x !== r)
    : [...next, r];
};

// Clave de localStorage que recuerda la familia activa entre sesiones.
export const ACTIVE_FAMILY_KEY = "nidu_familia_id";
