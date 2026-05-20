import { DAY_LABELS, getInitials, type Day, type Member } from "@/lib/family";
import type { Dish } from "@/lib/menu";

type Props = {
  day: Day;
  dish: Dish;
  cook: Member | null;
};

export function MenuDayCard({ day, dish, cook }: Props) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          aria-hidden
          className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-green-50 text-green-700"
        >
          <span className="text-[10px] font-medium uppercase tracking-wide">
            {DAY_LABELS[day]}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-tight text-gray-900">
              {dish.name}
            </h3>
            {cook && (
              <span
                title={`Cocina ${cook.name}`}
                aria-label={`Cocina ${cook.name}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700"
              >
                {getInitials(cook.name)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
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
            <span>{dish.minutes} min</span>
          </div>

          <div className="mt-2.5">
            {dish.forAll ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-600" />
                Apto para todos
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {dish.kidNote ?? "Adaptación para niño/a"}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
