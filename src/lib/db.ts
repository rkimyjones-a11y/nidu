import type { Age, Day, Member, Restriction } from "@/lib/family";
import type { MenuResponse } from "@/lib/menuApi";
import { supabase } from "@/lib/supabase";

export type Familia = {
  id: string;
  nombre: string;
  codigo: string;
};

export type Favorito = {
  id: string;
  nombre: string;
  tipo: "ia" | "manual";
};

type MiembroRow = {
  id: string;
  familia_id: string;
  nombre: string;
  tipo: string;
  restricciones: string[] | null;
  no_le_gusta: string | null;
  dias_cocina: string[] | null;
};

// ---- Mapeo Member <-> fila de Supabase --------------------------------------

const tipoToAge = (t: string): Age => (t === "adulto" ? "adulto" : "niño");
const ageToTipo = (a: Age): string => (a === "adulto" ? "adulto" : "nino");

const rowToMember = (r: MiembroRow): Member => ({
  id: r.id,
  name: r.nombre,
  age: tipoToAge(r.tipo),
  restrictions: (r.restricciones ?? []) as Restriction[],
  cookingDays: (r.dias_cocina ?? []) as Day[],
  dislikes: r.no_le_gusta ?? "",
});

// ---- Códigos de familia -----------------------------------------------------

// Sin caracteres ambiguos (I, O, 0, 1).
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomCode = (length = 6): string =>
  Array.from(
    { length },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join("");

// ---- Familias ---------------------------------------------------------------

export const createFamilia = async (nombre: string): Promise<Familia> => {
  // Reintenta si el código aleatorio colisiona con el índice único.
  for (let attempt = 0; attempt < 5; attempt++) {
    const codigo = randomCode();
    const { data, error } = await supabase
      .from("familias")
      .insert({ nombre: nombre.trim(), codigo })
      .select("id, nombre, codigo")
      .single();

    if (!error && data) return data as Familia;
    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }
  }
  throw new Error("No hemos podido generar un código único, inténtalo de nuevo");
};

export const getFamiliaById = async (id: string): Promise<Familia | null> => {
  const { data, error } = await supabase
    .from("familias")
    .select("id, nombre, codigo")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Familia | null) ?? null;
};

export const getFamiliaByCodigo = async (
  codigo: string,
): Promise<Familia | null> => {
  const { data, error } = await supabase
    .from("familias")
    .select("id, nombre, codigo")
    .eq("codigo", codigo.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Familia | null) ?? null;
};

// ---- Miembros ---------------------------------------------------------------

export const getMiembros = async (familiaId: string): Promise<Member[]> => {
  const { data, error } = await supabase
    .from("miembros")
    .select("id, familia_id, nombre, tipo, restricciones, no_le_gusta, dias_cocina")
    .eq("familia_id", familiaId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as MiembroRow[]).map(rowToMember);
};

export const insertMiembro = async (
  familiaId: string,
  member: Omit<Member, "id">,
): Promise<Member> => {
  const { data, error } = await supabase
    .from("miembros")
    .insert({
      familia_id: familiaId,
      nombre: member.name,
      tipo: ageToTipo(member.age),
      restricciones: member.restrictions,
      no_le_gusta: member.dislikes,
      dias_cocina: member.age === "adulto" ? member.cookingDays : [],
    })
    .select("id, familia_id, nombre, tipo, restricciones, no_le_gusta, dias_cocina")
    .single();
  if (error) throw new Error(error.message);
  return rowToMember(data as MiembroRow);
};

export const updateMiembro = async (member: Member): Promise<void> => {
  const { error } = await supabase
    .from("miembros")
    .update({
      nombre: member.name,
      tipo: ageToTipo(member.age),
      restricciones: member.restrictions,
      no_le_gusta: member.dislikes,
      dias_cocina: member.age === "adulto" ? member.cookingDays : [],
    })
    .eq("id", member.id);
  if (error) throw new Error(error.message);
};

export const deleteMiembro = async (id: string): Promise<void> => {
  const { error } = await supabase.from("miembros").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ---- Favoritos --------------------------------------------------------------

export const getFavoritos = async (
  familiaId: string,
): Promise<Favorito[]> => {
  const { data, error } = await supabase
    .from("favoritos")
    .select("id, nombre, tipo")
    .eq("familia_id", familiaId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Favorito[];
};

export const addFavorito = async (
  familiaId: string,
  nombre: string,
  tipo: "ia" | "manual" = "ia",
): Promise<Favorito> => {
  const { data, error } = await supabase
    .from("favoritos")
    .insert({ familia_id: familiaId, nombre: nombre.trim(), tipo })
    .select("id, nombre, tipo")
    .single();
  if (error) throw new Error(error.message);
  return data as Favorito;
};

export const deleteFavorito = async (id: string): Promise<void> => {
  const { error } = await supabase.from("favoritos").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ---- Menús ------------------------------------------------------------------

export const saveMenu = async (
  familiaId: string,
  semanaInicio: string,
  datos: MenuResponse,
): Promise<void> => {
  // Un registro por (familia, semana) gracias al índice único; upsert atómico.
  const { error } = await supabase.from("menus").upsert(
    { familia_id: familiaId, semana_inicio: semanaInicio, datos },
    { onConflict: "familia_id,semana_inicio" },
  );
  if (error) throw new Error(error.message);
};

export const getLatestMenu = async (
  familiaId: string,
): Promise<MenuResponse | null> => {
  const { data, error } = await supabase
    .from("menus")
    .select("datos")
    .eq("familia_id", familiaId)
    .order("semana_inicio", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { datos: MenuResponse } | null)?.datos ?? null;
};
