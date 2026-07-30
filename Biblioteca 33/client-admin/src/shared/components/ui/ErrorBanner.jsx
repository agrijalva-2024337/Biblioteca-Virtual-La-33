export const ErrorBanner = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mb-4 rounded-[var(--radius-card)] border border-[var(--danger)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
      {message}
    </div>
  );
};
