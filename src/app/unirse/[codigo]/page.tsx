"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFamiliaByCodigo, type Familia } from "@/lib/db";
import { ACTIVE_FAMILY_KEY } from "@/lib/family";

export default function UnirsePage() {
  const router = useRouter();
  const params = useParams<{ codigo: string }>();
  const codigo = (params?.codigo ?? "").toUpperCase();

  const [familia, setFamilia] = useState<Familia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fam = await getFamiliaByCodigo(codigo);
        if (cancelled) return;
        if (!fam) {
          setError("No encontramos ninguna familia con ese código.");
        } else {
          setFamilia(fam);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error buscando la familia");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [codigo]);

  const join = () => {
    if (!familia) return;
    try {
      window.localStorage.setItem(ACTIVE_FAMILY_KEY, familia.id);
    } catch {
      /* storage no disponible */
    }
    router.push("/");
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-5 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-2xl font-bold text-white">
          N
        </div>

        {loading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
            <p className="mt-3 text-sm text-gray-500">Buscando familia…</p>
          </div>
        )}

        {!loading && error && (
          <>
            <p className="mt-8 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-5 inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Ir al inicio
            </button>
          </>
        )}

        {!loading && familia && (
          <>
            <p className="mt-8 text-sm text-gray-600">Te han invitado a unirte a</p>
            <p className="text-2xl font-bold text-gray-900">{familia.nombre}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-green-700">
              {familia.codigo}
            </p>
            <button
              type="button"
              onClick={join}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
            >
              Unirme a {familia.nombre}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-3 w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Ahora no
            </button>
          </>
        )}
      </div>
    </div>
  );
}
