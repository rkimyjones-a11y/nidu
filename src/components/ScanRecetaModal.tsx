"use client";

import { useRef, useState } from "react";
import type { RecetaDraft } from "@/components/RecetaModal";
import type { RecetaIngrediente } from "@/lib/db";

const RECETA_CATEGORIAS = [
  "Carne",
  "Pescado",
  "Vegetariano",
  "Pasta",
  "Legumbres",
  "Otro",
];

type Props = {
  onScanned: (draft: RecetaDraft, preview: string | null) => void;
  onClose: () => void;
};

type Stage = "select" | "ready" | "loading" | "error";

// Redimensiona y recomprime a JPEG por debajo de ~1MB usando canvas.
const compressImage = (
  file: File,
  maxBytes = 1_000_000,
): Promise<{ base64: string; dataUrl: string; mimeType: string }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_DIM = 1280;
      let { width, height } = img;
      if (width > height && width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else if (height >= width && height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo procesar la imagen"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.85;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      // length*0.75 ≈ tamaño en bytes del base64
      while (dataUrl.length * 0.75 > maxBytes && quality > 0.3) {
        quality -= 0.15;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      const base64 = dataUrl.split(",")[1] ?? "";
      resolve({ base64, dataUrl, mimeType: "image/jpeg" });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };
    img.src = url;
  });

export function ScanRecetaModal({ onScanned, onClose }: Props) {
  const [stage, setStage] = useState<Stage>("select");
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reseleccionar el mismo archivo
    if (!file) return;
    setError(null);
    try {
      const { base64, dataUrl, mimeType } = await compressImage(file);
      setImage({ base64, mimeType });
      setPreview(dataUrl);
      setStage("ready");
    } catch {
      setError(
        "No hemos podido abrir esa imagen. Prueba con otra (jpg, png o webp).",
      );
      setStage("error");
    }
  };

  const analyze = async () => {
    if (!image) return;
    setStage("loading");
    setError(null);
    try {
      const res = await fetch("/api/escanear-receta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(image),
      });
      const data = (await res.json().catch(() => ({}))) as {
        receta?: {
          nombre: string;
          tiempo: number | null;
          categoria: string;
          ingredientes: RecetaIngrediente[];
          notas: string;
        };
        error?: string;
      };

      if (!res.ok || data.error || !data.receta) {
        setError(
          "No hemos podido leer la receta. Prueba con mejor iluminación o añádela manualmente.",
        );
        setStage("error");
        return;
      }

      const r = data.receta;
      const draft: RecetaDraft = {
        nombre: r.nombre ?? "",
        tiempo: typeof r.tiempo === "number" ? r.tiempo : null,
        categoria: RECETA_CATEGORIAS.includes(r.categoria)
          ? r.categoria
          : "Otro",
        ingredientes: Array.isArray(r.ingredientes) ? r.ingredientes : [],
        notas: r.notas ?? "",
        origen: "escaneada",
        imagen_url: null,
      };
      onScanned(draft, preview);
    } catch {
      setError(
        "No hemos podido leer la receta. Prueba con mejor iluminación o añádela manualmente.",
      );
      setStage("error");
    }
  };

  const reset = () => {
    setStage("select");
    setPreview(null);
    setImage(null);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Escanear receta</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Inputs ocultos */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*,.heic,.heif"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
          className="hidden"
          onChange={handleFile}
        />

        {stage === "select" && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-gray-600">
              Haz una foto de la receta o sube una imagen y la leeremos por ti.
            </p>
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:border-green-600"
            >
              <span className="text-2xl">📷</span>
              <span className="text-sm font-semibold text-gray-900">
                Hacer foto
              </span>
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:border-green-600"
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-sm font-semibold text-gray-900">
                Subir imagen
              </span>
            </button>
          </div>
        )}

        {stage === "ready" && preview && (
          <div className="mt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Vista previa de la receta"
              className="max-h-72 w-full rounded-2xl border border-gray-200 object-contain"
            />
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Elegir otra
              </button>
              <button
                type="button"
                onClick={analyze}
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
              >
                Analizar receta
              </button>
            </div>
          </div>
        )}

        {stage === "loading" && (
          <div className="mt-6 flex flex-col items-center justify-center py-10">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
            <p className="mt-4 text-base font-medium text-gray-700">
              📷 Analizando tu receta…
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Esto tarda unos segundos.
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="mt-6">
            <p className="rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700">
              {error}
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
              >
                Probar con otra imagen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
