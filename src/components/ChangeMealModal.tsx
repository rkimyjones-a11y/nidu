"use client";

import { useState } from "react";
import type { Receta } from "@/lib/db";

type Props = {
  recetas: Receta[];
  onGenerateAI: () => void;
  onPickReceta: (receta: Receta) => void;
  onClose: () => void;
};

export function ChangeMealModal({
  recetas,
  onGenerateAI,
  onPickReceta,
  onClose,
}: Props) {
  const [view, setView] = useState<"options" | "recetas">("options");

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {view === "options" ? "Cambiar plato" : "Elegir del recetario"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {view === "options" ? (
          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={onGenerateAI}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:border-green-600"
            >
              <span className="text-2xl">🤖</span>
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Generar con IA
                </span>
                <span className="block text-xs text-gray-500">
                  Un plato nuevo a medida de tu familia
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setView("recetas")}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:border-green-600"
            >
              <span className="text-2xl">📖</span>
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Elegir del recetario
                </span>
                <span className="block text-xs text-gray-500">
                  Usa una de tus recetas guardadas
                </span>
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-5">
            {recetas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-8 text-center">
                <p className="text-sm text-gray-500">
                  Aún no tienes recetas en tu recetario.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recetas.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onPickReceta(r)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-green-600"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900">
                          {r.nombre}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {[r.categoria, r.tiempo != null ? `${r.tiempo} min` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-green-700">
                        Elegir
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setView("options")}
              className="mt-3 w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
