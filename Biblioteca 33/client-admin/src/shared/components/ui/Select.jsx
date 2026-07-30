export const Select = ({
  label,
  error,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-[var(--text-muted)]">
          {label}
        </label>
      )}

      <select
        className={`
          w-full px-4 py-3 rounded-[var(--radius-control)]
          bg-[var(--bg-alt)]
          border border-[var(--border)]
          text-[var(--text-h)]
          outline-none
          focus:border-[var(--accent)]
          transition-all
          ${className}
        `}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p className="text-[var(--danger)] text-xs">
          {error}
        </p>
      )}
    </div>
  );
};
