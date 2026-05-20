"use client";

import { useState } from "react";
import {
  DAYS,
  DAY_LABELS,
  RESTRICTIONS,
  type Age,
  type Day,
  type Member,
  type Restriction,
} from "@/lib/family";

type Props = {
  onAdd: (member: Omit<Member, "id">) => void;
  onCancel: () => void;
};

export function MemberForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<Age>("adulto");
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [cookingDays, setCookingDays] = useState<Day[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleRestriction = (r: Restriction) => {
    setRestrictions((prev) => {
      if (r === "sin alergias") {
        return prev.includes(r) ? [] : [r];
      }
      const without = prev.filter((x) => x !== "sin alergias");
      return without.includes(r)
        ? without.filter((x) => x !== r)
        : [...without, r];
    });
  };

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
    onAdd({
      name: trimmed,
      age,
      restrictions,
      cookingDays: age === "adulto" ? cookingDays : [],
    });
  };

  const isAdult = age === "adulto";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="member-name"
            className="block text-sm font-medium text-gray-800"
          >
            Nombre
          </label>
          <input
            id="member-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ej. María"
            className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            autoFocus
          />
          {error && (
            <p className="mt-1.5 text-xs text-red-600">{error}</p>
          )}
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-800">Edad</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(["adulto", "niño"] as const).map((opt) => {
              const selected = age === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAge(opt)}
                  className={
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
                    (selected
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                  }
                  aria-pressed={selected}
                >
                  {opt === "adulto" ? "Adulto" : "Niño/a"}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-800">
            Restricciones alimentarias
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {RESTRICTIONS.map((r) => {
              const selected = restrictions.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRestriction(r)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                    (selected
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                  }
                  aria-pressed={selected}
                >
                  {r}
                </button>
              );
            })}
          </div>
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
                    className={
                      "rounded-lg border px-1 py-2 text-xs font-medium transition-colors " +
                      (selected
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                    }
                    aria-pressed={selected}
                    aria-label={DAY_LABELS[d]}
                  >
                    {DAY_LABELS[d]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          >
            Añadir miembro
          </button>
        </div>
      </div>
    </form>
  );
}
