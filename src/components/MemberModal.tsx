"use client";

import { useState } from "react";
import {
  DAYS,
  DAY_LABELS,
  RESTRICTIONS,
  toggleRestriction,
  type Age,
  type Day,
  type Member,
  type Restriction,
} from "@/lib/family";

export type MemberDraft = {
  name: string;
  age: Age;
  restrictions: Restriction[];
  cookingDays: Day[];
  dislikes: string;
};

type Props = {
  initial: Member | null;
  saving?: boolean;
  onSave: (draft: MemberDraft) => void;
  onClose: () => void;
};

export function MemberModal({ initial, saving = false, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState<Age>(initial?.age ?? "adulto");
  const [restrictions, setRestrictions] = useState<Restriction[]>(
    initial?.restrictions ?? [],
  );
  const [cookingDays, setCookingDays] = useState<Day[]>(
    initial?.cookingDays ?? [],
  );
  const [dislikes, setDislikes] = useState(initial?.dislikes ?? "");
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (d: Day) => {
    setCookingDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio");
      return;
    }
    onSave({
      name: trimmed,
      age,
      restrictions,
      cookingDays: age === "adulto" ? cookingDays : [],
      dislikes: dislikes.trim(),
    });
  };

  const isAdult = age === "adulto";

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-5"
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
            {initial ? "Editar miembro" : "Nuevo miembro"}
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
              htmlFor="m-name"
              className="block text-sm font-medium text-gray-800"
            >
              Nombre
            </label>
            <input
              id="m-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ej. María"
              autoFocus
              className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-800">Tipo</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(["adulto", "niño"] as const).map((opt) => {
                const selected = age === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAge(opt)}
                    aria-pressed={selected}
                    className={
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
                      (selected
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                    }
                  >
                    {opt === "adulto" ? "Adulto" : "Niño/a"}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-800">
              Restricciones
            </span>
            <div className="mt-1.5 max-h-36 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-2 pb-0.5">
                {RESTRICTIONS.map((r) => {
                  const selected = restrictions.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setRestrictions((prev) => toggleRestriction(prev, r))
                      }
                      aria-pressed={selected}
                      className={
                        "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors " +
                        (selected
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                      }
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="m-dislikes"
              className="block text-sm font-medium text-gray-800"
            >
              ¿Qué alimentos no te gustan?
            </label>
            <textarea
              id="m-dislikes"
              value={dislikes}
              onChange={(e) => setDislikes(e.target.value)}
              rows={2}
              placeholder="Ej. champiñones, pescado azul, brócoli…"
              className="mt-1.5 block w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          {isAdult && (
            <div>
              <span className="block text-sm font-medium text-gray-800">
                Días disponibles para cocinar
              </span>
              <div className="mt-1.5 grid grid-cols-7 gap-1.5">
                {DAYS.map((d) => {
                  const selected = cookingDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      aria-pressed={selected}
                      aria-label={DAY_LABELS[d]}
                      className={
                        "rounded-lg border px-1 py-2 text-xs font-medium transition-colors " +
                        (selected
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                      }
                    >
                      {DAY_LABELS[d]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
