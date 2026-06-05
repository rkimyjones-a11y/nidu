"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Logo } from "@/components/Logo";

// ---------------------------------------------------------------------------
// Tipos y constantes
// ---------------------------------------------------------------------------

type Platform = "android" | "ios" | "desktop" | "unknown";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const INSTALLED_KEY = "nidu_pwa_installed";
const SHARE_URL = "https://nidu-olive.vercel.app";
const SHARE_TEXT = "Planifica las comidas de tu familia con IA 🍽️";

// ---------------------------------------------------------------------------
// Detección
// ---------------------------------------------------------------------------

const detectPlatform = (): Platform => {
  if (typeof window === "undefined") return "unknown";
  const ua = window.navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
};

const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const navWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };
  return navWithStandalone.standalone === true;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type InstallCtx = {
  ready: boolean;
  platform: Platform;
  installed: boolean;
  canPromptNative: boolean;
  openModal: () => void;
};

const Ctx = createContext<InstallCtx | null>(null);

export function useInstallPWA(): InstallCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useInstallPWA debe usarse dentro de <InstallPWAProvider>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider — gestiona el evento beforeinstallprompt y monta el modal global
// ---------------------------------------------------------------------------

export function InstallPWAProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const flag = (() => {
      try {
        return window.localStorage.getItem(INSTALLED_KEY) === "true";
      } catch {
        return false;
      }
    })();
    const initialInstalled = isStandalone() || flag;

    const onBefore = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      try {
        window.localStorage.setItem(INSTALLED_KEY, "true");
      } catch {
        /* storage no disponible */
      }
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlatform(detectPlatform());
    setInstalled(initialInstalled);
    setReady(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        try {
          window.localStorage.setItem(INSTALLED_KEY, "true");
        } catch {
          /* storage no disponible */
        }
        setInstalled(true);
      }
    } catch {
      /* el usuario canceló o el navegador rechazó el prompt */
    } finally {
      setDeferredPrompt(null);
      closeModal();
    }
  }, [deferredPrompt, closeModal]);

  const value: InstallCtx = {
    ready,
    platform,
    installed,
    canPromptNative: deferredPrompt !== null,
    openModal,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {modalOpen && (
        <InstallModal
          platform={platform}
          canPromptNative={deferredPrompt !== null}
          onInstall={triggerInstall}
          onClose={closeModal}
        />
      )}
    </Ctx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Banner que se muestra en la pantalla de bienvenida
// ---------------------------------------------------------------------------

export function InstallBanner() {
  const { ready, installed, openModal } = useInstallPWA();
  if (!ready || installed) return null;
  return (
    <button
      type="button"
      onClick={openModal}
      className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-green-600/30 bg-green-50 px-4 py-3 text-left text-green-800 transition-colors hover:bg-green-100"
    >
      <span aria-hidden className="text-xl leading-none">
        📲
      </span>
      <span className="flex-1 text-sm font-medium">
        Instala Nidú en tu móvil — úsala como una app
      </span>
      <span aria-hidden className="text-base font-semibold text-green-700">
        →
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Filas para la pestaña Familia
// ---------------------------------------------------------------------------

export function InstallSettingsRow() {
  const { ready, installed, openModal } = useInstallPWA();
  if (!ready || installed) return null;
  return (
    <button
      type="button"
      onClick={openModal}
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-gray-900">
        <span aria-hidden className="text-base">
          📲
        </span>
        Instalar en este dispositivo
      </span>
      <span aria-hidden className="text-gray-300">
        →
      </span>
    </button>
  );
}

export function ShareNiduRow() {
  const [feedback, setFeedback] = useState<string | null>(null);

  const onShare = async () => {
    const data = {
      title: "Nidú",
      text: SHARE_TEXT,
      url: SHARE_URL,
    };
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`);
      setFeedback("¡Copiado!");
      setTimeout(() => setFeedback(null), 1800);
    } catch {
      /* cancelado o portapapeles bloqueado */
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-gray-900">
        <span aria-hidden className="text-base">
          🔗
        </span>
        Compartir Nidú
      </span>
      <span
        aria-hidden
        className={
          "text-xs font-medium " +
          (feedback ? "text-green-700" : "text-gray-300")
        }
      >
        {feedback ?? "→"}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

type ModalProps = {
  platform: Platform;
  canPromptNative: boolean;
  onInstall: () => void;
  onClose: () => void;
};

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className ?? "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 12v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}

function IOSIllustration() {
  // Marco de iPhone con la barra inferior de Safari y el icono de compartir
  // resaltado en verde para enseñar al usuario dónde mirar.
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 130"
      className="mx-auto h-32 w-auto"
      role="img"
    >
      {/* Cuerpo del teléfono */}
      <rect
        x="20"
        y="6"
        width="180"
        height="118"
        rx="14"
        fill="#f9fafb"
        stroke="#d1d5db"
        strokeWidth="2"
      />
      {/* Pantalla */}
      <rect x="30" y="16" width="160" height="80" rx="4" fill="#ffffff" />
      <rect x="36" y="22" width="120" height="6" rx="2" fill="#e5e7eb" />
      <rect x="36" y="34" width="148" height="4" rx="2" fill="#f3f4f6" />
      <rect x="36" y="42" width="148" height="4" rx="2" fill="#f3f4f6" />
      <rect x="36" y="50" width="100" height="4" rx="2" fill="#f3f4f6" />
      <rect x="36" y="62" width="148" height="4" rx="2" fill="#f3f4f6" />
      <rect x="36" y="70" width="148" height="4" rx="2" fill="#f3f4f6" />
      {/* Barra inferior de Safari */}
      <rect x="30" y="100" width="160" height="18" rx="3" fill="#f3f4f6" />
      {/* Iconos en la barra */}
      <g fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
        <path d="M44 109 l-3 -3 M44 109 l3 -3" />
        <path d="M62 106 l3 3 -3 3" />
      </g>
      {/* Icono de compartir destacado */}
      <circle
        cx="110"
        cy="109"
        r="9"
        fill="#dcfce7"
        stroke="#16a34a"
        strokeWidth="1.8"
      />
      <g
        stroke="#16a34a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M110 105 v6" />
        <path d="M107 107 l3 -3 l3 3" />
        <path d="M105 110 v3 a1 1 0 0 0 1 1 h8 a1 1 0 0 0 1 -1 v-3" />
      </g>
      {/* Flecha apuntando al icono */}
      <g stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M110 124 v-4" />
        <path d="M107 121 l3 3 l3 -3" />
      </g>
    </svg>
  );
}

function InstallModal({
  platform,
  canPromptNative,
  onInstall,
  onClose,
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {platform === "ios" ? "Instala Nidú en iPhone" : "Instala Nidú"}
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

        <div className="mt-5 flex justify-center">
          <Logo className="h-16 w-auto" />
        </div>

        {platform === "ios" ? (
          <div className="mt-5">
            <p className="text-sm text-gray-600">
              Safari no tiene un botón directo, pero se instala en 3 pasos:
            </p>
            <ol className="mt-4 space-y-3 text-sm text-gray-800">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                  1
                </span>
                <span className="flex items-center gap-1">
                  Pulsa el botón compartir
                  <ShareIcon className="inline h-4 w-4 text-gray-700" />
                  en Safari
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                  2
                </span>
                <span>Selecciona “Añadir a pantalla de inicio”</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                  3
                </span>
                <span>Pulsa “Añadir”</span>
              </li>
            </ol>

            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
              <IOSIllustration />
              <p className="mt-1 text-center text-xs text-gray-500">
                El botón compartir está en la barra inferior de Safari.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700"
            >
              Entendido
            </button>
          </div>
        ) : platform === "android" ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-gray-700">
              Añade Nidú a tu pantalla de inicio y úsala como una app normal,
              sin abrir el navegador.
            </p>
            {!canPromptNative && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Si el botón no aparece, abre el menú de Chrome ( ⋮ ) y elige
                “Añadir a pantalla de inicio”.
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Ahora no
              </button>
              <button
                type="button"
                onClick={onInstall}
                disabled={!canPromptNative}
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Instalar ahora
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-gray-700">
              Instala Nidú como aplicación de escritorio para acceder más
              rápido.
            </p>
            {!canPromptNative && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Si el botón no aparece, busca el icono de instalar (▢↓) en la
                barra de direcciones de Chrome o Edge.
              </p>
            )}
            <button
              type="button"
              onClick={canPromptNative ? onInstall : onClose}
              className="flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700"
            >
              {canPromptNative ? "Instalar" : "Entendido"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
