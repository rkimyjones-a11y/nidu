import type { GeneratedDish, SpanishDay } from "@/lib/menuApi";

type Props = {
  day: SpanishDay;
  comida: GeneratedDish;
  cena: GeneratedDish;
};

const SHORT: Record<SpanishDay, string> = {
  Lunes: "Lun",
  Martes: "Mar",
  Miércoles: "Mié",
  Jueves: "Jue",
  Viernes: "Vie",
  Sábado: "Sáb",
  Domingo: "Dom",
};

function ClockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v4l2.5 2" strokeLinecap="round" />
    </svg>
  );
}

function MealRow({ label, dish }: { label: string; dish: GeneratedDish }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            {label}
          </p>
          <p className="mt-0.5 text-base font-semibold leading-snug text-gray-900">
            {dish.nombre}
          </p>
        </div>
        {dish.cocinero && (
          <span
            title={`Cocina ${dish.cocinero}`}
            aria-label={`Cocina ${dish.cocinero}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700"
          >
            {dish.cocinero}
          </span>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
          <ClockIcon />
          {dish.tiempo} min
        </span>

        {dish.apto ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-600" />
            Apto para todos
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {dish.adaptacion ?? "Adaptación para algún miembro"}
          </span>
        )}
      </div>
    </div>
  );
}

export function MenuDayCard({ day, comida, cena }: Props) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[11px] font-semibold uppercase tracking-wide text-green-700"
        >
          {SHORT[day]}
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{day}</h3>
      </div>

      <div className="mt-4 space-y-4">
        <MealRow label="Comida" dish={comida} />
        <div className="border-t border-gray-100" />
        <MealRow label="Cena" dish={cena} />
      </div>
    </article>
  );
}
