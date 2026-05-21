"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MenuDayCard } from "@/components/MenuDayCard";
import { FavoritesModal } from "@/components/FavoritesModal";
import type { Favorito } from "@/lib/db";
import type { Member } from "@/lib/family";
import {
  SPANISH_DAYS,
  fetchMenu,
  getWeekRange,
  type MenuResponse,
  type SpanishDay,
} from "@/lib/menuApi";

type Props = {
  members: Member[];
  menu: MenuResponse | null;
  familiaId: string;
  favoritos: Favorito[];
  onMenuChange: (menu: MenuResponse | null) => void;
  onToggleFavorito: (nombre: string) => void;
  onAddFavoritoManual: (nombre: string) => void;
  onRemoveFavorito: (id: string) => void;
  onGoFamilia: () => void;
};

export function MenuTab({
  members,
  menu,
  familiaId,
  favoritos,
  onMenuChange,
  onToggleFavorito,
  onAddFavoritoManual,
  onRemoveFavorito,
  onGoFamilia,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<Set<SpanishDay>>(new Set());
  const [favOpen, setFavOpen] = useState(false);

  const week = useMemo(() => getWeekRange(new Date()), []);

  const favSet = useMemo(
    () => new Set(favoritos.map((f) => f.nombre.toLowerCase())),
    [favoritos],
  );
  const isFavorite = useCallback(
    (nombre: string) => favSet.has(nombre.toLowerCase()),
    [favSet],
  );

  const generate = useCallback(async () => {
    if (members.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMenu(members, { familiaId });
      onMenuChange(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ha ocurrido un problema generando tu menú. Vuelve a intentarlo.",
      );
    } finally {
      setLoading(false);
    }
  }, [members, familiaId, onMenuChange]);

  const regenerateDay = useCallback(
    async (dia: SpanishDay) => {
      if (!menu || members.length === 0) return;
      setRegenerating((prev) => {
        const next = new Set(prev);
        next.add(dia);
        return next;
      });
      setError(null);
      try {
        const platosExistentes = menu.semana
          .filter((d) => d.dia !== dia)
          .flatMap((d) => [d.comida.nombre, d.cena.nombre]);

        const data = await fetchMenu(members, {
          modo: "dia",
          dia,
          platosExistentes,
          familiaId,
        });
        const fresh = data.semana[0];
        if (!fresh) throw new Error("Respuesta vacía de Gemini");

        onMenuChange({
          ...menu,
          semana: menu.semana.map((d) => (d.dia === dia ? fresh : d)),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `No hemos podido regenerar ${dia}.`,
        );
      } finally {
        setRegenerating((prev) => {
          const next = new Set(prev);
          next.delete(dia);
          return next;
        });
      }
    },
    [members, menu, familiaId, onMenuChange],
  );

  // Auto-generar al entrar a la pestaña si hay familia pero no menú aún.
  useEffect(() => {
    if (members.length > 0 && !menu && !loading && !error) {
      // Auto-generación al entrar en la pestaña (fetch-on-mount intencionado).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderedDays = useMemo(() => {
    if (!menu) return [];
    const byName = new Map(menu.semana.map((d) => [d.dia, d]));
    return SPANISH_DAYS.map((name) => byName.get(name)).filter(
      (d): d is NonNullable<typeof d> => Boolean(d),
    );
  }, [menu]);

  const noFamily = members.length === 0;

  return (
    <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-8 sm:pt-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Esta semana
          </h1>
          <p className="mt-2 text-base text-gray-600">{week.label}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setFavOpen(true)}
            aria-label="Mis platos favoritos"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-green-600 hover:text-green-600"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5.5 4.5 4.5 0 0 0 2 8.5C2 10.7 3.5 12.5 5 14l7 7Z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading || noFamily}
            aria-label="Regenerar menú"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-green-600 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className={"h-5 w-5 " + (loading ? "animate-spin" : "")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 15.5-6.36L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.5 6.36L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>
      </header>

      {noFamily && (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-10 text-center">
          <p className="text-sm text-gray-600">
            Para generar tu menú primero cuéntanos quién come en casa.
          </p>
          <button
            type="button"
            onClick={onGoFamilia}
            className="mt-4 inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Configurar mi familia
          </button>
        </div>
      )}

      {!noFamily && loading && !menu && (
        <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
          <p className="mt-4 text-base font-medium text-gray-700">
            Generando tu menú…
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Estamos pensando 14 platos a medida de tu familia.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700"
        >
          <p className="font-semibold">No hemos podido generar el menú.</p>
          <p className="mt-1 text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void generate()}
            className="mt-3 inline-flex rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {menu && (
        <section className="mt-8 space-y-3" aria-busy={loading}>
          {orderedDays.map((d) => (
            <MenuDayCard
              key={d.dia}
              day={d.dia}
              comida={d.comida}
              cena={d.cena}
              regenerating={regenerating.has(d.dia)}
              onRegenerate={() => void regenerateDay(d.dia)}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorito}
            />
          ))}
        </section>
      )}

      {favOpen && (
        <FavoritesModal
          favoritos={favoritos}
          onAdd={onAddFavoritoManual}
          onDelete={onRemoveFavorito}
          onClose={() => setFavOpen(false)}
        />
      )}
    </main>
  );
}
