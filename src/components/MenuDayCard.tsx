import type { GeneratedDish, ProteinaLevel, SpanishDay } from "@/lib/menuApi";

export type MealSlot = "comida" | "cena";

type Props = {
  day: SpanishDay;
  comida: GeneratedDish;
  cena: GeneratedDish;
  regeneratingComida?: boolean;
  regeneratingCena?: boolean;
  onChangeMeal?: (slot: MealSlot) => void;
  isFavorite?: (nombre: string) => boolean;
  onToggleFavorite?: (nombre: string) => void;
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

const PROTEIN_STYLES: Record<ProteinaLevel, { bg: string; label: string }> = {
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
      className={"inline-block h-2 w-2 shrink-0 rounded-full " + style.bg}
    />
  );
}

function HeartButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Añadir a favoritos"}
      className={
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors " +
        (active
          ? "text-green-600 hover:bg-green-50"
          : "text-gray-300 hover:bg-gray-100 hover:text-green-600")
      }
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5.5 4.5 4.5 0 0 0 2 8.5C2 10.7 3.5 12.5 5 14l7 7Z" />
      </svg>
    </button>
  );
}

function MealRow({
  label,
  dish,
  regenerating,
  onChange,
  isFavorite,
  onToggleFavorite,
}: {
  label: string;
  dish: GeneratedDish;
  regenerating?: boolean;
  onChange?: () => void;
  isFavorite?: (nombre: string) => boolean;
  onToggleFavorite?: (nombre: string) => void;
}) {
  if (regenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
        <p className="mt-2 text-xs text-gray-500">Buscando platos…</p>
      </div>
    );
  }

  const fromRecetario = dish.origen === "recetario";

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              {label}
            </p>
            <span className="text-[10px] font-medium text-gray-400">
              {fromRecetario ? "📖 Del recetario" : "🤖 IA"}
            </span>
          </div>
          <p className="mt-0.5 text-base font-semibold leading-snug text-gray-900">
            {dish.nombre}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {onToggleFavorite && (
            <HeartButton
              active={isFavorite?.(dish.nombre) ?? false}
              onClick={() => onToggleFavorite(dish.nombre)}
            />
          )}
          {dish.cocinero && (
            <span
              title={`Cocina ${dish.cocinero}`}
              aria-label={`Cocina ${dish.cocinero}`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700"
            >
              {dish.cocinero}
            </span>
          )}
        </div>
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

        {onChange && (
          <button
            type="button"
            onClick={onChange}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-green-700"
          >
            ↺ Cambiar
          </button>
        )}
      </div>
    </div>
  );
}

export function MenuDayCard({
  day,
  comida,
  cena,
  regeneratingComida = false,
  regeneratingCena = false,
  onChangeMeal,
  isFavorite,
  onToggleFavorite,
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
      </div>

      <div className="mt-4 space-y-4">
        <MealRow
          label="Comida"
          dish={comida}
          regenerating={regeneratingComida}
          onChange={onChangeMeal ? () => onChangeMeal("comida") : undefined}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
        <div className="border-t border-gray-100" />
        <MealRow
          label="Cena"
          dish={cena}
          regenerating={regeneratingCena}
          onChange={onChangeMeal ? () => onChangeMeal("cena") : undefined}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </article>
  );
}
