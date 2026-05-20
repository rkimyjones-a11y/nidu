"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MenuDayCard } from "@/components/MenuDayCard";
import { DAYS, SAMPLE_FAMILY } from "@/lib/family";
import {
  SAMPLE_DISHES,
  assignCook,
  getWeekRange,
  pickWeeklyDishes,
} from "@/lib/menu";

export default function MenuPage() {
  const [seed, setSeed] = useState(0);

  const week = useMemo(() => getWeekRange(new Date()), []);
  const dishes = useMemo(
    () => pickWeeklyDishes(SAMPLE_DISHES, seed),
    [seed],
  );

  const days = DAYS.map((day, i) => ({
    day,
    dish: dishes[i]!,
    cook: assignCook(day, SAMPLE_FAMILY, seed),
  }));

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
            onClick={() => setSeed((s) => s + 1)}
            aria-label="Regenerar menú"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-green-600 hover:text-green-700"
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
              <path d="M3 12a9 9 0 0 1 15.5-6.36L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.5 6.36L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </header>

        <section className="mt-8 space-y-3">
          {days.map(({ day, dish, cook }) => (
            <MenuDayCard key={day} day={day} dish={dish} cook={cook} />
          ))}
        </section>

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
            className="flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
          >
            Ver lista de la compra
          </Link>
        </div>
      </div>
    </div>
  );
}
