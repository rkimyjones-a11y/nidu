"use client";

import { useState } from "react";
import type { Favorito } from "@/lib/db";

type Props = {
  favoritos: Favorito[];
  onAdd: (nombre: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function FavoritesModal({ favoritos, onAdd, onDelete, onClose }: Props) {
  const [nuevo, setNuevo] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = nuevo.trim();
    if (!value) return;
    onAdd(value);
    setNuevo("");
  };

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
          <h2 className="text-lg font-bold text-gray-900">Mis platos favoritos</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-600">
          Los usaremos para sugerir tus platos preferidos al generar el menú.
        </p>

        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder="Añadir plato propio…"
            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            + Añadir
          </button>
        </form>

        <div className="mt-4">
          {favoritos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-8 text-center">
              <p className="text-sm text-gray-500">
                Aún no tienes favoritos. Marca el corazón en un plato del menú o
                añade uno propio arriba.
              </p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-gray-200">
              {favoritos.map((f, idx) => (
                <li
                  key={f.id}
                  className={
                    (idx > 0 ? "border-t border-gray-100 " : "") +
                    "flex items-center justify-between gap-3 bg-white px-4 py-3"
                  }
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {f.nombre}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      {f.tipo === "manual" ? "Añadido por ti" : "Del menú"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(f.id)}
                    aria-label={`Eliminar ${f.nombre}`}
                    className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
