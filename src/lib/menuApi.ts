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

export type GeneratedDish = {
  nombre: string;
  tiempo: number;
  apto: boolean;
  adaptacion: string | null;
  cocinero: string;
  ingredientes: GeneratedIngredient[];
};

export type GeneratedDay = {
  dia: SpanishDay;
  comida: GeneratedDish;
  cena: GeneratedDish;
};

export type MenuResponse = {
  semana: GeneratedDay[];
};

export const CACHE_KEY = "nidu:menu:v1";

export const readCachedMenu = (): MenuResponse | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as MenuResponse) : null;
  } catch {
    return null;
  }
};

export const writeCachedMenu = (menu: MenuResponse): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(menu));
  } catch {
    // quota exceeded or storage disabled — non-fatal
  }
};

export const fetchMenu = async (members: Member[]): Promise<MenuResponse> => {
  const res = await fetch("/api/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No hemos podido generar el menú");
  }
  return (await res.json()) as MenuResponse;
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
