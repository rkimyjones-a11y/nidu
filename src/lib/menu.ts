import { DAYS, type Day, type Member } from "@/lib/family";
import type { Ingredient } from "@/lib/shopping";

export type Dish = {
  id: string;
  name: string;
  minutes: number;
  forAll: boolean;
  kidNote?: string;
  ingredients: Ingredient[];
};

export const SAMPLE_DISHES: Dish[] = [
  {
    id: "d-1",
    name: "Salmón al horno con verduras",
    minutes: 35,
    forAll: false,
    kidNote: "Filete sin especias para Lucía",
    ingredients: [
      { name: "Salmón", amount: 600, unit: "g", category: "carnes" },
      { name: "Calabacín", amount: 2, unit: "ud", category: "verduras" },
      { name: "Pimiento rojo", amount: 2, unit: "ud", category: "verduras" },
      { name: "Limón", amount: 1, unit: "ud", category: "verduras" },
      { name: "Aceite de oliva", amount: 50, unit: "ml", category: "otros" },
    ],
  },
  {
    id: "d-2",
    name: "Pasta integral con boloñesa de lentejas",
    minutes: 30,
    forAll: false,
    kidNote: "Versión con pasta sin gluten",
    ingredients: [
      { name: "Pasta integral", amount: 400, unit: "g", category: "despensa" },
      { name: "Pasta sin gluten", amount: 200, unit: "g", category: "despensa" },
      { name: "Lentejas cocidas", amount: 1, unit: "bote", category: "despensa" },
      { name: "Cebolla", amount: 1, unit: "ud", category: "verduras" },
      { name: "Zanahoria", amount: 2, unit: "ud", category: "verduras" },
      { name: "Tomate triturado", amount: 500, unit: "g", category: "otros" },
    ],
  },
  {
    id: "d-3",
    name: "Arroz salteado con pollo y verduras",
    minutes: 25,
    forAll: true,
    ingredients: [
      { name: "Arroz", amount: 400, unit: "g", category: "despensa" },
      { name: "Pechuga de pollo", amount: 500, unit: "g", category: "carnes" },
      { name: "Brócoli", amount: 1, unit: "ud", category: "verduras" },
      { name: "Pimiento", amount: 1, unit: "ud", category: "verduras" },
      { name: "Salsa de soja", amount: 1, unit: "bote", category: "otros" },
    ],
  },
  {
    id: "d-4",
    name: "Crema de calabaza y tostadas",
    minutes: 20,
    forAll: false,
    kidNote: "Tostadas sin gluten",
    ingredients: [
      { name: "Calabaza", amount: 1, unit: "ud", category: "verduras" },
      { name: "Cebolla", amount: 1, unit: "ud", category: "verduras" },
      { name: "Caldo de verduras", amount: 500, unit: "ml", category: "otros" },
      { name: "Pan tostado sin gluten", amount: 1, unit: "paquete", category: "despensa" },
    ],
  },
  {
    id: "d-5",
    name: "Tortilla de patatas con ensalada",
    minutes: 40,
    forAll: true,
    ingredients: [
      { name: "Patatas", amount: 1, unit: "kg", category: "verduras" },
      { name: "Huevos", amount: 8, unit: "ud", category: "lacteos" },
      { name: "Cebolla", amount: 1, unit: "ud", category: "verduras" },
      { name: "Lechuga", amount: 1, unit: "ud", category: "verduras" },
      { name: "Tomate cherry", amount: 200, unit: "g", category: "verduras" },
    ],
  },
  {
    id: "d-6",
    name: "Tacos de pavo con guacamole",
    minutes: 25,
    forAll: false,
    kidNote: "Tortilla de maíz para Lucía",
    ingredients: [
      { name: "Pavo picado", amount: 500, unit: "g", category: "carnes" },
      { name: "Aguacate", amount: 2, unit: "ud", category: "verduras" },
      { name: "Lima", amount: 1, unit: "ud", category: "verduras" },
      { name: "Tortillas de trigo", amount: 1, unit: "paquete", category: "despensa" },
      { name: "Tortillas de maíz", amount: 1, unit: "paquete", category: "despensa" },
    ],
  },
  {
    id: "d-7",
    name: "Pizza casera de verduras",
    minutes: 45,
    forAll: false,
    kidNote: "Base sin gluten",
    ingredients: [
      { name: "Base de pizza", amount: 1, unit: "ud", category: "despensa" },
      { name: "Base de pizza sin gluten", amount: 1, unit: "ud", category: "despensa" },
      { name: "Mozzarella", amount: 200, unit: "g", category: "lacteos" },
      { name: "Tomate triturado", amount: 200, unit: "g", category: "otros" },
      { name: "Calabacín", amount: 1, unit: "ud", category: "verduras" },
      { name: "Pimiento", amount: 1, unit: "ud", category: "verduras" },
    ],
  },
  {
    id: "d-8",
    name: "Lentejas estofadas con arroz",
    minutes: 50,
    forAll: true,
    ingredients: [
      { name: "Lentejas", amount: 400, unit: "g", category: "despensa" },
      { name: "Arroz", amount: 200, unit: "g", category: "despensa" },
      { name: "Cebolla", amount: 1, unit: "ud", category: "verduras" },
      { name: "Zanahoria", amount: 2, unit: "ud", category: "verduras" },
      { name: "Dientes de ajo", amount: 2, unit: "ud", category: "verduras" },
    ],
  },
  {
    id: "d-9",
    name: "Pollo al limón con patatas asadas",
    minutes: 45,
    forAll: true,
    ingredients: [
      { name: "Pollo entero", amount: 1, unit: "ud", category: "carnes" },
      { name: "Patatas", amount: 1, unit: "kg", category: "verduras" },
      { name: "Limón", amount: 2, unit: "ud", category: "verduras" },
      { name: "Romero fresco", amount: 1, unit: "manojo", category: "verduras" },
    ],
  },
];

const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const pickWeeklyDishes = (dishes: Dish[], seed: number): Dish[] => {
  const rng = mulberry32(seed + 1);
  const pool = [...dishes];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, 7);
};

export const assignCook = (
  day: Day,
  family: Member[],
  seed: number,
): Member | null => {
  const adults = family.filter((m) => m.age === "adulto");
  if (adults.length === 0) return null;

  const dayIdx = DAYS.indexOf(day);
  const available = adults.filter((m) => m.cookingDays.includes(day));
  const pool = available.length > 0 ? available : adults;
  return pool[(dayIdx + seed) % pool.length] ?? null;
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
