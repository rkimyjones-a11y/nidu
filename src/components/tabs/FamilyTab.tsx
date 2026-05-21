"use client";

import { useState } from "react";
import { MemberCard } from "@/components/MemberCard";
import { MemberModal, type MemberDraft } from "@/components/MemberModal";
import type { Familia } from "@/lib/db";
import type { Member } from "@/lib/family";

type Props = {
  familia: Familia | null;
  members: Member[];
  onAdd: (draft: MemberDraft) => Promise<void>;
  onEdit: (member: Member) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onLeave: () => void;
};

export function FamilyTab({
  familia,
  members,
  onAdd,
  onEdit,
  onRemove,
  onLeave,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isEmpty = members.length === 0;

  const openNew = () => {
    setEditing(null);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditing(member);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (draft: MemberDraft) => {
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

  const copyCode = async () => {
    if (!familia) return;
    try {
      await navigator.clipboard.writeText(familia.codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard bloqueado */
    }
  };

  return (
    <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-8 sm:pt-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {familia?.nombre ?? "Tu familia"}
          </h1>
          <p className="mt-2 text-base text-gray-600">
            {isEmpty
              ? "Cuéntanos quién come en casa"
              : `${members.length} ${members.length === 1 ? "miembro" : "miembros"} en casa`}
          </p>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          Salir
        </button>
      </header>

      {familia && (
        <button
          type="button"
          onClick={copyCode}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-left"
        >
          <span className="text-sm text-gray-600">
            Código:{" "}
            <span className="font-semibold tracking-[0.2em] text-green-700">
              {familia.codigo}
            </span>
          </span>
          <span className="text-xs font-medium text-green-700">
            {copied ? "¡Copiado!" : "Copiar"}
          </span>
        </button>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mt-6 space-y-3">
        {members.map((m) => (
          <MemberCard
            key={m.id}
            member={m}
            onEdit={openEdit}
            onRemove={handleRemove}
          />
        ))}

        {isEmpty && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-10 text-center">
            <p className="text-sm text-gray-500">
              Aún no has añadido a nadie. Empieza por ti.
            </p>
          </div>
        )}
      </section>

      <div className="mt-5">
        <button
          type="button"
          onClick={openNew}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-700"
        >
          <span aria-hidden className="text-lg leading-none">
            +
          </span>
          Añadir miembro
        </button>
      </div>

      {modalOpen && (
        <MemberModal
          initial={editing}
          saving={saving}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}
