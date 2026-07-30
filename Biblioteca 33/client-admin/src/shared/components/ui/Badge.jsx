const VARIANTS = {
  success: 'bg-[var(--success-bg)] text-[var(--success)]',
  danger: 'bg-[var(--danger-bg)] text-[var(--danger)]',
  warning: 'bg-[rgba(232,132,43,0.15)] text-[var(--accent)]',
  neutral: 'bg-white/10 text-[var(--text-muted)]',
};

// Mapea el status real de File / Moderation a un variant visual.
const STATUS_VARIANT = {
  approved: 'success',
  APPROVED: 'success',
  rejected: 'danger',
  REJECTED: 'danger',
  pending: 'warning',
  PENDING: 'warning',
};

export const Badge = ({ variant, status, children }) => {
  const resolved = variant || STATUS_VARIANT[status] || 'neutral';

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-semibold
        ${VARIANTS[resolved] || VARIANTS.neutral}
      `}
    >
      {children ?? status}
    </span>
  );
};
