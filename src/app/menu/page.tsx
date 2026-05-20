import Link from "next/link";

export default function MenuPage() {
  return (
    <div className="min-h-dvh bg-white">
      <main className="mx-auto w-full max-w-xl px-5 pt-16 pb-16">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Menú semanal
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Aquí aparecerá el menú generado para tu familia.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Volver
        </Link>
      </main>
    </div>
  );
}
