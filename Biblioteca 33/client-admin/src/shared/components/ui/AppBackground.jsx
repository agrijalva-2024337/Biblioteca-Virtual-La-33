const BG_SRC = '/library-bg.png';

const OVERLAY = {
  /** Auth forms — overlay medio (default histórico ~82). */
  default: {
    tint: 'bg-[var(--bg)]/82',
    gradient: 'bg-gradient-to-b from-black/50 via-[var(--bg)]/75 to-[var(--bg)]',
  },
  /** Login / registro — imagen de biblioteca legible + foco en el panel. */
  auth: {
    tint: 'bg-[var(--bg)]/70',
    gradient:
      'bg-gradient-to-b from-[var(--bg)]/40 via-[var(--bg)]/65 to-[var(--bg)]/90',
  },
  /** Dashboard — más imagen a través de navbar/sidebar. */
  light: {
    tint: 'bg-[var(--bg)]/55',
    gradient: 'bg-gradient-to-b from-black/30 via-[var(--bg)]/50 to-[var(--bg)]/80',
  },
  /** Landing — más oscuro para que resalte la marca. */
  strong: {
    tint: 'bg-[var(--bg)]/78',
    gradient: 'bg-gradient-to-b from-black/55 via-[var(--bg)]/72 to-[var(--bg)]',
  },
};

/**
 * @param {'default' | 'light' | 'strong' | 'auth'} [overlay]
 * @param {boolean} [grain] textura sutil de papel/grano
 */
export const AppBackground = ({
  children,
  className = '',
  fillHeight = false,
  overlay = 'default',
  grain = false,
}) => {
  const layers = OVERLAY[overlay] || OVERLAY.default;

  return (
    <div className={`relative min-h-screen ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_SRC})` }}
        aria-hidden
      />
      <div className={`pointer-events-none absolute inset-0 ${layers.tint}`} aria-hidden />
      <div className={`pointer-events-none absolute inset-0 ${layers.gradient}`} aria-hidden />
      {grain ? <div className="bg-grain pointer-events-none absolute inset-0" aria-hidden /> : null}
      <div className={`relative z-10${fillHeight ? ' h-full' : ''}`}>{children}</div>
    </div>
  );
};
