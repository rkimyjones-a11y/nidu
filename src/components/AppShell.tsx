"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { CompraTab } from "@/components/tabs/CompraTab";
import { FamilyTab } from "@/components/tabs/FamilyTab";
import { MenuTab } from "@/components/tabs/MenuTab";
import { RecetarioTab } from "@/components/tabs/RecetarioTab";
import type { Member } from "@/lib/family";
import {
  addFavorito,
  deleteFavorito,
  deleteMiembro,
  deleteReceta,
  getFamiliaById,
  getFavoritos,
  getLatestMenu,
  getMiembros,
  getRecetas,
  insertMiembro,
  insertReceta,
  saveMenu,
  updateMiembro,
  updateReceta,
  type Familia,
  type Favorito,
  type Receta,
} from "@/lib/db";
import type { MemberDraft } from "@/components/MemberModal";
import type { RecetaDraft } from "@/components/RecetaModal";
import { getWeekRange, toISODate, type MenuResponse } from "@/lib/menuApi";

type Props = {
  familiaId: string;
  onLeave: () => void;
};

export function AppShell({ familiaId, onLeave }: Props) {
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("familia");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const semanaInicio = useMemo(
    () => toISODate(getWeekRange(new Date()).monday),
    [],
  );

  // Carga inicial desde Supabase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [fam, mem, fav, lastMenu, recs] = await Promise.all([
          getFamiliaById(familiaId),
          getMiembros(familiaId),
          getFavoritos(familiaId),
          getLatestMenu(familiaId),
          // Resiliente: si la tabla "recetas" aún no existe, no bloquea la app.
          getRecetas(familiaId).catch(() => [] as Receta[]),
        ]);
        if (cancelled) return;
        setFamilia(fam);
        setMembers(mem);
        setFavoritos(fav);
        setMenu(lastMenu);
        setRecetas(recs);
        setActiveTab(mem.length > 0 ? "menu" : "familia");
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "No se pudo cargar tu familia",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [familiaId]);

  // ---- Miembros -------------------------------------------------------------

  const addMember = useCallback(
    async (draft: MemberDraft) => {
      const created = await insertMiembro(familiaId, draft);
      setMembers((prev) => [...prev, created]);
    },
    [familiaId],
  );

  const editMember = useCallback(async (member: Member) => {
    await updateMiembro(member);
    setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
  }, []);

  const removeMember = useCallback(async (id: string) => {
    await deleteMiembro(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ---- Favoritos ------------------------------------------------------------

  const toggleFavorito = useCallback(
    async (nombre: string) => {
      const existing = favoritos.find(
        (f) => f.nombre.toLowerCase() === nombre.toLowerCase(),
      );
      if (existing) {
        await deleteFavorito(existing.id);
        setFavoritos((prev) => prev.filter((f) => f.id !== existing.id));
      } else {
        const created = await addFavorito(familiaId, nombre, "ia");
        setFavoritos((prev) => [created, ...prev]);
      }
    },
    [familiaId, favoritos],
  );

  const addFavoritoManual = useCallback(
    async (nombre: string) => {
      const created = await addFavorito(familiaId, nombre, "manual");
      setFavoritos((prev) => [created, ...prev]);
    },
    [familiaId],
  );

  const removeFavorito = useCallback(async (id: string) => {
    await deleteFavorito(id);
    setFavoritos((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ---- Recetario ------------------------------------------------------------

  const addReceta = useCallback(
    async (draft: RecetaDraft) => {
      const created = await insertReceta(familiaId, draft);
      setRecetas((prev) => [created, ...prev]);
    },
    [familiaId],
  );

  const editReceta = useCallback(async (receta: Receta) => {
    await updateReceta(receta);
    setRecetas((prev) => prev.map((r) => (r.id === receta.id ? receta : r)));
  }, []);

  const removeReceta = useCallback(async (id: string) => {
    await deleteReceta(id);
    setRecetas((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ---- Menú -----------------------------------------------------------------

  const updateMenu = useCallback(
    (next: MenuResponse | null) => {
      setMenu(next);
      if (next) {
        // persistencia best-effort; no bloquea la UI
        void saveMenu(familiaId, semanaInicio, next).catch(() => undefined);
      }
    },
    [familiaId, semanaInicio],
  );

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-sm text-red-600">{loadError}</p>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center px-5 py-2">
          <Logo className="h-8 w-auto" />
        </div>
      </header>

      <div className="pb-20">
        {activeTab === "familia" && (
          <FamilyTab
            familia={familia}
            members={members}
            onAdd={addMember}
            onEdit={editMember}
            onRemove={removeMember}
            onLeave={onLeave}
          />
        )}
        {activeTab === "menu" && (
          <MenuTab
            members={members}
            menu={menu}
            familiaId={familiaId}
            favoritos={favoritos}
            recetas={recetas}
            onMenuChange={updateMenu}
            onToggleFavorito={toggleFavorito}
            onAddFavoritoManual={addFavoritoManual}
            onRemoveFavorito={removeFavorito}
            onGoFamilia={() => setActiveTab("familia")}
          />
        )}
        {activeTab === "recetario" && (
          <RecetarioTab
            recetas={recetas}
            onAdd={addReceta}
            onEdit={editReceta}
            onRemove={removeReceta}
          />
        )}
        {activeTab === "compra" && (
          <CompraTab
            members={members}
            menu={menu}
            familiaId={familiaId}
            checked={checked}
            onCheckedChange={setChecked}
            onGoMenu={() => setActiveTab("menu")}
            onGoFamilia={() => setActiveTab("familia")}
          />
        )}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
