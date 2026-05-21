"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Welcome } from "@/components/Welcome";
import { ACTIVE_FAMILY_KEY } from "@/lib/family";

export default function Page() {
  const [hydrated, setHydrated] = useState(false);
  const [familiaId, setFamiliaId] = useState<string | null>(null);

  useEffect(() => {
    let id: string | null = null;
    try {
      id = window.localStorage.getItem(ACTIVE_FAMILY_KEY);
    } catch {
      /* storage no disponible */
    }
    // Lectura de localStorage tras montar: patrón de hidratación seguro.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFamiliaId(id);
    setHydrated(true);
  }, []);

  const enter = (id: string) => {
    try {
      window.localStorage.setItem(ACTIVE_FAMILY_KEY, id);
    } catch {
      /* storage no disponible */
    }
    setFamiliaId(id);
  };

  const leave = () => {
    try {
      window.localStorage.removeItem(ACTIVE_FAMILY_KEY);
    } catch {
      /* storage no disponible */
    }
    setFamiliaId(null);
  };

  // Esqueleto neutro antes de leer localStorage (evita mismatch SSR/cliente)
  if (!hydrated) {
    return <div className="min-h-dvh bg-white" />;
  }

  if (!familiaId) {
    return <Welcome onReady={enter} />;
  }

  return <AppShell familiaId={familiaId} onLeave={leave} />;
}
