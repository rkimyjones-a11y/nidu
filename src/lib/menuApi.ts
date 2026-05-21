import type { Member } from "@/lib/family";
import type { Category, Unit } from "@/lib/shopping";

export const SPANISH_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;
export type SpanishDay = (typeof SPANISH_DAYS)[number];

export type GeneratedIngredient = {
  nombre: string;
  cantidad: number;
  unidad: Unit;
  categoria: Category;
};

export type ProteinaLevel = "alta" | "media" | "baja";
export type MacroLevel = "alto" | "medio" | "bajo";

export type Nutrientes = {
  proteina: ProteinaLevel;
  carbohidratos: MacroLevel;
  grasas: ProteinaLevel;
  calorias_aprox: number;
};

export type GeneratedDish = {
  nombre: string;
  tiempo: number;
  apto: boolean;
  adaptacion: string | null;
  cocinero: string;
  ingredientes: GeneratedIngredient[];
  // Optional para compatibilidad con menús generados antes de añadir el campo.
  nutrientes?: Nutrientes;
};

export type GeneratedDay = {
  dia: SpanishDay;
  comida: GeneratedDish;
  cena: GeneratedDish;
};

export type MenuResponse = {
  semana: GeneratedDay[];
};

export type GenerateMenuOptions = (
  | { modo?: "semana" }
  | { modo: "dia"; dia: SpanishDay; platosExistentes?: string[] }
) & { familiaId?: string };

export const fetchMenu = async (
  members: Member[],
  options: GenerateMenuOptions = {},
): Promise<MenuResponse> => {
  const { familiaId, ...rest } = options;
  const res = await fetch("/api/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members, familia_id: familiaId, ...rest }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No hemos podido generar el menú");
  }
  return (await res.json()) as MenuResponse;
};

// Fecha local en formato YYYY-MM-DD (sin desfase de zona horaria).
export const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getWeekRange = (today: Date) => {
  const dow = today.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
  });
  return {
    monday,
    sunday,
    label: `${fmt.format(monday)} – ${fmt.format(sunday)}`,
  };
};
