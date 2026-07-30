export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`
          w-full ${maxWidth}
          max-h-[min(90vh,720px)]
          flex flex-col
          overflow-hidden
          rounded-[28px]
          border border-[var(--border)]
          bg-[var(--bg-card)]
          shadow-[var(--shadow-lg)]
          my-auto
        `}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--text-h)]">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-xl px-3 py-1 text-xl leading-none text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-h)]"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
