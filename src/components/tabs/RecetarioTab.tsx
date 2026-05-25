"use client";

import { useState } from "react";
import { RecetaModal, type RecetaDraft } from "@/components/RecetaModal";
import type { Receta, RecetaOrigen } from "@/lib/db";

type Props = {
  recetas: Receta[];
  onAdd: (draft: RecetaDraft) => Promise<void>;
  onEdit: (receta: Receta) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

const ORIGEN_BADGE: Record<RecetaOrigen, string> = {
  escaneada: "📷 Escaneada",
  manual: "✏️ Manual",
  favorita: "❤️ Favorita",
};

export function RecetarioTab({ recetas, onAdd, onEdit, onRemove }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Receta | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (receta: Receta) => {
    setEditing(receta);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (draft: RecetaDraft) => {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await onEdit({ ...editing, ...draft });
      } else {
        await onAdd(draft);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await onRemove(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
    }
  };

  return (
    <main className="mx-auto w-full max-w-xl px-5 pt-6 pb-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Nuestro recetario
          </h1>
          <p className="mt-2 text-base text-gray-600">
            {recetas.length === 0
              ? "Guarda los platos de casa"
              : `${recetas.length} ${recetas.length === 1 ? "receta" : "recetas"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="shrink-0 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
        >
          + Nueva receta
        </button>
      </header>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {recetas.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-12 text-center">
          <p className="text-sm text-gray-500">
            Aún no tienes recetas guardadas. ¡Añade la primera!
          </p>
        </div>
      ) : (
        <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recetas.map((r) => (
            <article
              key={r.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h3 className="text-base font-semibold leading-snug text-gray-900">
                {r.nombre}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {r.tiempo != null && <span>{r.tiempo} min</span>}
                {r.categoria && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {r.categoria}
                  </span>
                )}
              </div>
              <span className="mt-2 inline-flex w-fit items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                {ORIGEN_BADGE[r.origen]}
              </span>

              <div className="mt-3 flex items-center gap-1 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(r)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(r.id)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {modalOpen && (
        <RecetaModal
          initial={editing}
          saving={saving}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}
