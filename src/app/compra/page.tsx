"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  SAMPLE_DISHES,
  getWeekRange,
  pickWeeklyDishes,
} from "@/lib/menu";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  aggregateIngredients,
  formatQuantity,
  formatWeekSentence,
  ingredientKey,
  type Category,
  type Ingredient,
} from "@/lib/shopping";

export default function CompraPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const week = useMemo(() => getWeekRange(new Date()), []);
  const weekSentence = useMemo(
    () => formatWeekSentence(week.monday, week.sunday),
    [week],
  );

  const grouped = useMemo(() => {
    const dishes = pickWeeklyDishes(SAMPLE_DISHES, 0);
    const all = aggregateIngredients(dishes);
    const map = new Map<Category, Ingredient[]>();
    for (const ing of all) {
      const list = map.get(ing.category) ?? [];
      list.push(ing);
      map.set(ing.category, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    }
    return map;
  }, []);

  const total = useMemo(
    () => Array.from(grouped.values()).reduce((acc, l) => acc + l.length, 0),
    [grouped],
  );

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleShare = async () => {
    const lines: string[] = [`La compra · ${weekSentence}`, ""];
    for (const category of CATEGORY_ORDER) {
      const list = grouped.get(category);
      if (!list || list.length === 0) continue;
      lines.push(CATEGORY_LABELS[category]);
      for (const ing of list) {
        lines.push(`  • ${ing.name} — ${formatQuantity(ing)}`);
      }
      lines.push("");
    }
    lines.push("Lista generada por Nidú · nidu.app");
    const text = lines.join("\n");

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: "Lista de la compra", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareFeedback("Copiada al portapapeles");
      setTimeout(() => setShareFeedback(null), 2200);
    } catch {
      // user cancelled share or clipboard blocked — silent
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-32 sm:pt-16">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              La compra
            </h1>
            <p className="mt-2 text-base text-gray-600">{weekSentence}</p>
            <p className="mt-1 text-sm font-medium text-green-700">
              {checked.size} de {total} productos
            </p>
          </div>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartir lista"
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
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
              <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
            </svg>
          </button>
        </header>

        {shareFeedback && (
          <div
            role="status"
            className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700"
          >
            {shareFeedback}
          </div>
        )}

        <section className="mt-8 space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const items = grouped.get(category);
            if (!items || items.length === 0) return null;
            return (
              <div key={category}>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {CATEGORY_LABELS[category]}
                </h2>
                <ul className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {items.map((ing, idx) => {
                    const key = ingredientKey(ing);
                    const isChecked = checked.has(key);
                    return (
                      <li
                        key={key}
                        className={
                          (idx > 0 ? "border-t border-gray-100 " : "") +
                          "flex items-center gap-3 px-4 py-3"
                        }
                      >
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isChecked}
                          aria-label={`Marcar ${ing.name}`}
                          onClick={() => toggle(key)}
                          className={
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors " +
                            (isChecked
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-gray-300 bg-white hover:border-green-600")
                          }
                        >
                          {isChecked && (
                            <svg
                              aria-hidden
                              viewBox="0 0 20 20"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="4 10.5 8.5 15 16 6" />
                            </svg>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          className="flex flex-1 items-center justify-between gap-3 text-left"
                        >
                          <span
                            className={
                              "text-sm transition-colors " +
                              (isChecked
                                ? "text-gray-400 line-through"
                                : "text-gray-900")
                            }
                          >
                            {ing.name}
                          </span>
                          <span
                            className={
                              "shrink-0 text-sm font-medium transition-colors " +
                              (isChecked
                                ? "text-gray-400 line-through"
                                : "text-gray-500")
                            }
                          >
                            {formatQuantity(ing)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>

        <p className="mt-10 text-center text-xs text-gray-400">
          Lista generada por Nidú · nidu.app
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-xl">
          <Link
            href="/menu"
            className="flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
          >
            ← Volver al menú
          </Link>
        </div>
      </div>
    </div>
  );
}
