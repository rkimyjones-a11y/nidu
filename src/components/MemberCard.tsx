import type { Member } from "@/lib/family";
import { DAY_LABELS } from "@/lib/family";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
};

type Props = {
  member: Member;
  onRemove: (id: string) => void;
};

export function MemberCard({ member, onRemove }: Props) {
  const initials = getInitials(member.name);
  const isAdult = member.age === "adulto";

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-base font-semibold text-green-700"
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {member.name}
            </h3>
            <button
              type="button"
              onClick={() => onRemove(member.id)}
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={`Quitar a ${member.name}`}
            >
              Quitar
            </button>
          </div>

          <p className="mt-0.5 text-sm text-gray-500">
            {isAdult ? "Adulto" : "Niño/a"}
          </p>

          {member.restrictions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {member.restrictions.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                >
                  {r}
                </span>
              ))}
            </div>
          )}

          {isAdult && member.cookingDays.length > 0 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Cocina
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {member.cookingDays.map((d) => (
                  <span
                    key={d}
                    className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                  >
                    {DAY_LABELS[d]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
