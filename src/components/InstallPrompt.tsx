"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "nidu_install_dismissed";

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Si el usuario ya lo cerró, no volver a mostrarlo.
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* storage no disponible */
    }

    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (isIOS && !isStandalone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage no disponible */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 px-3">
      <div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-green-200 bg-white px-4 py-3 shadow-lg">
        <p className="min-w-0 flex-1 text-sm text-gray-700">
          📲 Instala Nidú: pulsa compartir → Añadir a inicio
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
