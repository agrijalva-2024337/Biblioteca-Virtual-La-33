const LOGO_SRC = '/la33-logo.png';

const sizes = {
  xs: 'h-8 w-auto',
  sm: 'h-10 w-auto',
  md: 'h-12 w-auto',
  lg: 'h-16 w-auto',
  xl: 'h-24 w-auto',
  hero: 'h-28 w-auto sm:h-36',
};

const textSizes = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
  hero: 'text-4xl sm:text-5xl',
};

export const Logo = ({
  size = 'md',
  showText = false,
  title = 'La 33',
  subtitle,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${showText ? '' : 'shrink-0'} ${className}`}>
      <img
        src={LOGO_SRC}
        alt="La 33 — Biblioteca Estudiantil Online"
        className={`${sizes[size] || sizes.md} max-w-[min(100%,14rem)] object-contain drop-shadow-[0_0_18px_rgba(232,132,43,0.35)]`}
        draggable={false}
      />
      {showText && (
        <div className="leading-tight">
          {badge && (
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--text-muted)]">
              {badge}
            </p>
          )}
          <p className={`font-display font-bold text-[var(--text-h)] ${textSizes[size] || textSizes.md}`}>
            {title}
          </p>
          {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};

/** Marca centrada como en la propuesta: icono transparente + wordmark debajo. */
export const LogoBrand = ({ className = '', horizontal = false, size = 'xl' }) => {
  if (horizontal) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <Logo size={size === 'xl' ? 'lg' : size} />
        <div className="text-left">
          <p className="font-display text-2xl font-bold tracking-tight text-[var(--text-h)]">La 33</p>
          <p className="text-sm text-[var(--text-muted)]">Biblioteca Estudiantil Online</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <Logo size={size} />
      <p className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-[var(--text-h)]">
        La 33
      </p>
      <p className="mt-1 text-sm tracking-wide text-[var(--text-muted)] sm:text-base">
        Biblioteca Estudiantil Online
      </p>
    </div>
  );
};
