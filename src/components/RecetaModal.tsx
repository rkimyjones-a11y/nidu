"use client";

import { useState } from "react";
import type { Receta, RecetaIngrediente } from "@/lib/db";

export const RECETA_CATEGORIAS = [
  "Carne",
  "Pescado",
  "Vegetariano",
  "Pasta",
  "Legumbres",
  "Otro",
] as const;

export type RecetaDraft = Omit<Receta, "id">;

type Props = {
  initial: Receta | null;
  saving?: boolean;
  onSave: (draft: RecetaDraft) => void;
  onClose: () => void;
};

export function RecetaModal({ initial, saving = false, onSave, onClose }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [tiempo, setTiempo] = useState(
    initial?.tiempo != null ? String(initial.tiempo) : "",
  );
  const [categoria, setCategoria] = useState(initial?.categoria ?? "Otro");
  const [ingredientes, setIngredientes] = useState<RecetaIngrediente[]>(
    initial && initial.ingredientes.length > 0
      ? initial.ingredientes
      : [{ nombre: "", cantidad: "" }],
  );
  const [notas, setNotas] = useState(initial?.notas ?? "");
  const [error, setError] = useState<string | null>(null);

  const updateIng = (i: number, field: keyof RecetaIngrediente, value: string) => {
    setIngredientes((prev) =>
      prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)),
    );
  };

  const addIngRow = () =>
    setIngredientes((prev) => [...prev, { nombre: "", cantidad: "" }]);

  const removeIngRow = (i: number) =>
    setIngredientes((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) {
      setError("El nombre del plato es obligatorio");
      return;
    }
    const cleanedIngredientes = ingredientes
      .map((i) => ({ nombre: i.nombre.trim(), cantidad: i.cantidad.trim() }))
      .filter((i) => i.nombre !== "");
    const parsedTiempo = tiempo.trim() === "" ? null : Number(tiempo);

    onSave({
      nombre: trimmed,
      tiempo:
        parsedTiempo != null && !Number.isNaN(parsedTiempo)
          ? parsedTiempo
          : null,
      categoria,
      ingredientes: cleanedIngredientes,
      notas: notas.trim(),
      origen: initial?.origen ?? "manual",
      imagen_url: initial?.imagen_url ?? null,
    });
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
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? "Editar receta" : "Nueva receta"}
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="r-nombre"
              className="block text-sm font-medium text-gray-800"
            >
              Nombre del plato
            </label>
            <input
              id="r-nombre"
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ej. Lentejas de la abuela"
              autoFocus
              className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          <div>
            <label
              htmlFor="r-tiempo"
              className="block text-sm font-medium text-gray-800"
            >
              Tiempo de preparación (min)
            </label>
            <input
              id="r-tiempo"
              type="number"
              min={0}
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
              placeholder="30"
              className="mt-1.5 block w-32 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-800">
              Categoría
            </span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {RECETA_CATEGORIAS.map((c) => {
                const selected = categoria === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoria(c)}
                    aria-pressed={selected}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                      (selected
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-800">
              Ingredientes
            </span>
            <div className="mt-1.5 space-y-2">
              {ingredientes.map((ing, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ing.nombre}
                    onChange={(e) => updateIng(i, "nombre", e.target.value)}
                    placeholder="Ingrediente"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                  <input
                    type="text"
                    value={ing.cantidad}
                    onChange={(e) => updateIng(i, "cantidad", e.target.value)}
                    placeholder="500g"
                    className="w-24 shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngRow(i)}
                    aria-label="Quitar ingrediente"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngRow}
              className="mt-2 text-sm font-medium text-green-700 hover:text-green-800"
            >
              + Añadir ingrediente
            </button>
          </div>

          <div>
            <label
              htmlFor="r-notas"
              className="block text-sm font-medium text-gray-800"
            >
              Notas (opcional)
            </label>
            <textarea
              id="r-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Pasos, trucos, variantes…"
              className="mt-1.5 block w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar receta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
