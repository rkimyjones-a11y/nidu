"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MenuDayCard } from "@/components/MenuDayCard";
import { SAMPLE_FAMILY } from "@/lib/family";
import {
  SPANISH_DAYS,
  fetchMenu,
  getWeekRange,
  readCachedMenu,
  writeCachedMenu,
  type MenuResponse,
} from "@/lib/menuApi";

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const week = useMemo(() => getWeekRange(new Date()), []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMenu(SAMPLE_FAMILY);
      setMenu(data);
      writeCachedMenu(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ha ocurrido un problema generando tu menú. Vuelve a intentarlo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = readCachedMenu();
    if (cached) {
      setMenu(cached);
      setLoading(false);
      return;
    }
    void generate();
  }, [generate]);

  const orderedDays = useMemo(() => {
    if (!menu) return [];
    const byName = new Map(menu.semana.map((d) => [d.dia, d]));
    return SPANISH_DAYS.map((name) => byName.get(name)).filter(
      (d): d is NonNullable<typeof d> => Boolean(d),
    );
  }, [menu]);

  return (
    <div className="min-h-dvh bg-white">
      <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-32 sm:pt-16">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Esta semana
            </h1>
            <p className="mt-2 text-base text-gray-600">{week.label}</p>
          </div>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading}
            aria-label="Regenerar menú"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-green-600 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        </header>

        {loading && !menu && (
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
              />
            ))}
          </section>
        )}

        <div className="mt-8 flex justify-start">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            ← Editar familia
          </Link>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-xl">
          <Link
            href="/compra"
            aria-disabled={!menu}
            tabIndex={menu ? 0 : -1}
            onClick={(e) => {
              if (!menu) e.preventDefault();
            }}
            className={
              "flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-base font-semibold shadow-sm transition-colors " +
              (menu
                ? "bg-green-600 text-white hover:bg-green-700"
                : "cursor-not-allowed bg-gray-100 text-gray-400")
            }
          >
            Ver lista de la compra
          </Link>
        </div>
      </div>
    </div>
  );
}
