"use client";

import { useState } from "react";
import { MemberCard } from "@/components/MemberCard";
import { MemberForm } from "@/components/MemberForm";
import type { Member } from "@/lib/family";

type Props = {
  members: Member[];
  onChange: (members: Member[]) => void;
};

export function FamilyTab({ members, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const isEmpty = members.length === 0;

  const addMember = (m: Omit<Member, "id">) => {
    onChange([...members, { ...m, id: crypto.randomUUID() }]);
    setShowForm(false);
  };

  const removeMember = (id: string) => {
    onChange(members.filter((m) => m.id !== id));
  };

  return (
    <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-8 sm:pt-16">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Tu familia
        </h1>
        <p className="mt-2 text-base text-gray-600">
          {isEmpty
            ? "Cuéntanos quién come en casa"
            : `${members.length} ${members.length === 1 ? "miembro" : "miembros"} en casa`}
        </p>
      </header>

      <section className="mt-8 space-y-3">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} onRemove={removeMember} />
        ))}

        {isEmpty && !showForm && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-10 text-center">
            <p className="text-sm text-gray-500">
              Aún no has añadido a nadie. Empieza por ti.
            </p>
          </div>
        )}
      </section>

      <div className="mt-5">
        {showForm ? (
          <MemberForm
            onAdd={addMember}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-700"
          >
            <span aria-hidden className="text-lg leading-none">
              +
            </span>
            Añadir miembro
          </button>
        )}
      </div>
    </main>
  );
}
