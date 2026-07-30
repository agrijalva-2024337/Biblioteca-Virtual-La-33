export const PageHeader = ({
  title,
  subtitle,
  action,
  eyebrow,
}) => {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-h)] md:text-[2.35rem]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  );
};
