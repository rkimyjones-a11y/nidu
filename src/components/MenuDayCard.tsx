import type { GeneratedDish, ProteinaLevel, SpanishDay } from "@/lib/menuApi";

type Props = {
  day: SpanishDay;
  comida: GeneratedDish;
  cena: GeneratedDish;
  regenerating?: boolean;
  onRegenerate?: () => void;
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

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={"h-4 w-4 " + (spinning ? "animate-spin" : "")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 15.5-6.36L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.36L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

const PROTEIN_STYLES: Record<
  ProteinaLevel,
  { bg: string; label: string }
> = {
  alta: { bg: "bg-green-500", label: "Proteína alta" },
  media: { bg: "bg-orange-500", label: "Proteína media" },
  baja: { bg: "bg-gray-400", label: "Proteína baja" },
};

function ProteinDot({ level }: { level: ProteinaLevel }) {
  const style = PROTEIN_STYLES[level];
  return (
    <span
      role="img"
      aria-label={style.label}
      title={style.label}
      className={
        "inline-block h-2 w-2 shrink-0 rounded-full " + style.bg
      }
    />
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

        {dish.nutrientes && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <ProteinDot level={dish.nutrientes.proteina} />
            {dish.nutrientes.calorias_aprox} kcal
          </span>
        )}

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

export function MenuDayCard({
  day,
  comida,
  cena,
  regenerating = false,
  onRegenerate,
}: Props) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[11px] font-semibold uppercase tracking-wide text-green-700"
        >
          {SHORT[day]}
        </div>
        <h3 className="flex-1 text-sm font-semibold text-gray-700">{day}</h3>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            aria-label={`Regenerar ${day}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshIcon spinning={regenerating} />
          </button>
        )}
      </div>

      {regenerating ? (
        <div className="mt-4 flex flex-col items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
          <p className="mt-2 text-sm text-gray-500">Buscando platos…</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <MealRow label="Comida" dish={comida} />
          <div className="border-t border-gray-100" />
          <MealRow label="Cena" dish={cena} />
        </div>
      )}
    </article>
  );
}
