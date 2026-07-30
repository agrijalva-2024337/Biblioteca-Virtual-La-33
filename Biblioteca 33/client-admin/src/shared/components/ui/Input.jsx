export const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-[var(--text-muted)]">
          {label}
        </label>
      )}

      <input
        className={`
          w-full rounded-[var(--radius-control)]
          border border-[var(--border)]
          bg-[var(--bg-alt)]
          px-4 py-3
          text-sm text-[var(--text-h)]
          outline-none
          transition-all

          focus:border-[var(--accent)]
          focus:ring-2
          focus:ring-[var(--accent)]/30

          placeholder:text-[var(--text-muted)]

          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
};
