"use client";

import Link from "next/link";
import { useState } from "react";
import { MemberCard } from "@/components/MemberCard";
import { MemberForm } from "@/components/MemberForm";
import type { Member } from "@/lib/family";

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);

  const addMember = (m: Omit<Member, "id">) => {
    setMembers((prev) => [
      ...prev,
      { ...m, id: crypto.randomUUID() },
    ]);
    setShowForm(false);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const canContinue = members.length > 0;

  return (
    <div className="min-h-dvh bg-white">
      <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-32 sm:pt-16">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tu familia
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Cuéntanos quién come en casa
          </p>
        </header>

        <section className="mt-8 space-y-3">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} onRemove={removeMember} />
          ))}

          {members.length === 0 && !showForm && (
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
              <span aria-hidden className="text-lg leading-none">+</span>
              Añadir miembro
            </button>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-xl">
          <Link
            href="/menu"
            aria-disabled={!canContinue}
            tabIndex={canContinue ? 0 : -1}
            onClick={(e) => {
              if (!canContinue) e.preventDefault();
            }}
            className={
              "flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-base font-semibold shadow-sm transition-colors " +
              (canContinue
                ? "bg-green-600 text-white hover:bg-green-700"
                : "cursor-not-allowed bg-gray-100 text-gray-400")
            }
          >
            Generar menú semanal
          </Link>
        </div>
      </div>
    </div>
  );
}
