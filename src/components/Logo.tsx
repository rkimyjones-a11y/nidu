type Props = {
  className?: string;
};

export function Logo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 238 90"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Nidú"
    >
      {/* Nido */}
      <path
        d="M 10 54 Q 35 72 60 54"
        stroke="#16a34a"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 4 58 Q 18 48 26 56"
        stroke="#16a34a"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 56 56 Q 46 48 36 56"
        stroke="#16a34a"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 8 62 Q 22 54 30 60"
        stroke="#16a34a"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 52 60 Q 40 54 34 62"
        stroke="#16a34a"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Huevos */}
      <ellipse cx="24" cy="50" rx="8" ry="6" fill="#bbf7d0" />
      <ellipse cx="36" cy="48" rx="8" ry="6" fill="#86efac" />
      <ellipse cx="46" cy="51" rx="7" ry="5.5" fill="#bbf7d0" />
      {/* Texto */}
      <text
        x="84"
        y="62"
        fontFamily="Georgia, serif"
        fontSize="48"
        fontWeight="700"
        fill="#14532d"
      >
        Nid
      </text>
      <text
        x="84"
        y="62"
        fontFamily="Georgia, serif"
        fontSize="48"
        fontWeight="700"
        fill="#16a34a"
        dx="108"
      >
        ú
      </text>
    </svg>
  );
}
