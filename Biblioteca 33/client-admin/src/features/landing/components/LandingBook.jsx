/**
 * Libro visto de lado (lomo hacia el espectador).
 * Tres variantes de color dentro de la paleta de marca — no tres copias idénticas.
 */
const VARIANTS = [
  {
    spine: '#e8842b',
    spineDark: '#c96f1f',
    cover: '#c96f1f',
    pages: '#f3e9dc',
    ink: '#2a1c0f',
    lean: -4,
  },
  {
    spine: '#2b1f16',
    spineDark: '#1c150f',
    cover: '#3a2c20',
    pages: '#d8c7b3',
    ink: '#f3e9dc',
    lean: 2,
  },
  {
    spine: '#f3e9dc',
    spineDark: '#d8c7b3',
    cover: '#e8d9c4',
    pages: '#fff8ef',
    ink: '#2b1f16',
    lean: 5,
  },
];

export const LandingBook = ({ colorIndex = 0, className = '', titleMark = '' }) => {
  const v = VARIANTS[colorIndex % VARIANTS.length];

  return (
    <div className={className}>
      <svg
        viewBox="0 0 72 140"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        style={{ transform: `rotate(${v.lean}deg)`, transformOrigin: '50% 100%' }}
      >
        <ellipse cx="36" cy="132" rx="26" ry="4" fill="#000" opacity="0.28" />

        <path
          d="M48 18 C50 18, 54 20, 55 26 L58 118 C58 124, 54 126, 48 126 L48 18 Z"
          fill={v.pages}
          stroke={v.ink}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M50 28 C52 40, 52 55, 51 70" fill="none" stroke={v.ink} strokeWidth="0.8" opacity="0.35" />
        <path d="M52 34 C54 50, 54 70, 53 88" fill="none" stroke={v.ink} strokeWidth="0.7" opacity="0.28" />
        <path d="M54 42 C55 60, 56 85, 55 108" fill="none" stroke={v.ink} strokeWidth="0.7" opacity="0.22" />

        <path
          d="M44 14 C46 14, 48 16, 48 20 L48 124 C48 128, 46 130, 42 130 L40 16 C40 14, 42 14, 44 14 Z"
          fill={v.cover}
          stroke={v.ink}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d="M16 12 C14 12, 12 14, 12 18 L12 122 C12 128, 16 130, 22 130 L42 130 C46 130, 48 128, 48 124 L48 18 C48 14, 44 12, 38 12 Z"
          fill={v.spine}
          stroke={v.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        <path
          d="M18 28 C20 27, 40 27, 42 29"
          fill="none"
          stroke={v.spineDark}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M18 110 C20 111, 40 111, 42 109"
          fill="none"
          stroke={v.spineDark}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
        />

        {titleMark ? (
          <text
            x="30"
            y="78"
            fill={v.ink}
            fontSize="9"
            fontFamily="Fraunces, Georgia, serif"
            fontWeight="700"
            textAnchor="middle"
            transform="rotate(-90 30 78)"
            opacity="0.85"
          >
            {titleMark}
          </text>
        ) : (
          <>
            <path
              d="M26 48 C28 60, 28 80, 26 96"
              fill="none"
              stroke={v.ink}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.45"
            />
            <path
              d="M32 52 C34 65, 34 85, 32 100"
              fill="none"
              stroke={v.ink}
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.3"
            />
          </>
        )}
      </svg>
    </div>
  );
};
