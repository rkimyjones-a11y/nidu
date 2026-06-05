"use client";

import { useState } from "react";
import { InstallBanner } from "@/components/InstallPWA";
import { Logo } from "@/components/Logo";
import { createFamilia, getFamiliaByCodigo, type Familia } from "@/lib/db";

type View = "home" | "create" | "created" | "join";

type Props = {
  onReady: (familiaId: string) => void;
};

function Brand() {
  return (
    <div className="flex flex-col items-center">
      <Logo className="h-24 w-auto" />
      <p className="mt-3 text-lg text-gray-500">La cena de hoy, resuelta.</p>
    </div>
  );
}

export function Welcome({ onReady }: Props) {
  const [view, setView] = useState<View>("home");
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [lookup, setLookup] = useState<Familia | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareLink = familia
    ? `https://nidu.app/unirse/${familia.codigo}`
    : "";

  const handleCreate = async () => {
    if (!nombre.trim()) {
      setError("Pon un nombre a tu familia");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fam = await createFamilia(nombre);
      setFamilia(fam);
      setView("created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la familia");
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    const code = codigo.trim().toUpperCase();
    if (code.length < 4) {
      setError("Introduce el código de tu familia");
      return;
    }
    setLoading(true);
    setError(null);
    setLookup(null);
    try {
      const fam = await getFamiliaByCodigo(code);
      if (!fam) {
        setError("No encontramos ninguna familia con ese código");
        return;
      }
      setLookup(fam);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error buscando la familia");
    } finally {
      setLoading(false);
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

  const shareInvite = async () => {
    if (!familia) return;
    const text = `Únete a nuestra familia en Nidú con el código ${familia.codigo}: ${shareLink}`;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: "Únete a mi familia en Nidú", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* cancelado */
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-5 py-10">
      <div className="w-full max-w-sm">
        {view === "home" && (
          <>
            <Brand />
            <div className="mt-12 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setView("create");
                  setError(null);
                }}
                className="flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
              >
                Crear mi familia
              </button>
              <InstallBanner />
              <button
                type="button"
                onClick={() => {
                  setView("join");
                  setError(null);
                }}
                className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:border-green-600 hover:text-green-700"
              >
                Tengo un código → Unirme a una familia
              </button>
            </div>
          </>
        )}

        {view === "create" && (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Crea tu familia
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Ponle un nombre para reconocerla.
            </p>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ej. Los García"
              autoFocus
              className="mt-6 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creando…" : "Crear familia"}
            </button>
            <button
              type="button"
              onClick={() => setView("home")}
              className="mt-3 w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              ← Volver
            </button>
          </>
        )}

        {view === "created" && familia && (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              ¡{familia.nombre} está lista!
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Comparte este código para que tu familia se una.
            </p>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/60 px-5 py-6 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Código de familia
              </p>
              <p className="mt-1 text-3xl font-bold tracking-[0.3em] text-green-700">
                {familia.codigo}
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={copyCode}
                className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {copied ? "¡Copiado!" : "Copiar código"}
              </button>
              <button
                type="button"
                onClick={shareInvite}
                className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Compartir enlace
              </button>
            </div>
            <p className="mt-2 truncate text-center text-xs text-gray-400">
              {shareLink}
            </p>

            <button
              type="button"
              onClick={() => onReady(familia.id)}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
            >
              Continuar → añadir miembros
            </button>
          </>
        )}

        {view === "join" && (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Únete a una familia
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Introduce el código de 6 caracteres que te han compartido.
            </p>
            <input
              type="text"
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value.toUpperCase());
                if (error) setError(null);
                if (lookup) setLookup(null);
              }}
              placeholder="FAM7K2"
              maxLength={6}
              autoFocus
              className="mt-6 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-center text-lg font-semibold uppercase tracking-[0.3em] text-gray-900 placeholder:tracking-normal placeholder:text-gray-300 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            {lookup ? (
              <div className="mt-5">
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-center">
                  <p className="text-sm text-green-700">Vas a unirte a</p>
                  <p className="text-lg font-bold text-green-800">
                    {lookup.nombre}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onReady(lookup.id)}
                  className="mt-3 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
                >
                  Unirme a {lookup.nombre}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLookup}
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Buscando…" : "Buscar familia"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setView("home")}
              className="mt-3 w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              ← Volver
            </button>
          </>
        )}
      </div>
    </div>
  );
}
