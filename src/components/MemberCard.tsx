import { DAY_LABELS, getInitials, type Member } from "@/lib/family";

type Props = {
  member: Member;
  onRemove: (id: string) => void;
  onEdit: (member: Member) => void;
};

export function MemberCard({ member, onRemove, onEdit }: Props) {
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
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(member)}
                className="rounded-md px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                aria-label={`Editar a ${member.name}`}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onRemove(member.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label={`Quitar a ${member.name}`}
              >
                Quitar
              </button>
            </div>
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

          {member.dislikes && (
            <p className="mt-2 text-xs text-gray-500">
              <span className="text-gray-400">No le gusta:</span>{" "}
              {member.dislikes}
            </p>
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
