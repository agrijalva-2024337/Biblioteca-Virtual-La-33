export const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variants = {
    primary: `
      bg-[var(--accent)]
      hover:bg-[var(--accent-bright)]
      text-white
      font-semibold
      shadow-[0_10px_28px_rgba(232,132,43,0.38)]
      hover:shadow-[0_14px_36px_rgba(232,132,43,0.48)]
    `,
    secondary: `
      bg-[var(--bg-card)]/80
      border border-[var(--border)]
      text-[var(--text-h)]
      hover:border-[var(--accent)]
      hover:bg-[var(--bg-hover)]
      backdrop-blur-sm
    `,
    success: `
      bg-[var(--success)]
      hover:brightness-110
      text-white
      font-semibold
    `,
    danger: `
      bg-[var(--danger)]
      hover:brightness-110
      text-white
      font-semibold
    `,
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3
        rounded-xl
        transition-all duration-200
        hover:-translate-y-px
        disabled:opacity-60
        disabled:cursor-not-allowed
        disabled:hover:translate-y-0
        ${variants[variant] || variants.primary}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
