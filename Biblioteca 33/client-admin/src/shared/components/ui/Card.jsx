export const Card = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-[var(--bg-card)]/85
        border border-[var(--border)]
        rounded-2xl
        p-5
        shadow-[var(--shadow-sm)]
        backdrop-blur-md
        transition-[border-color,box-shadow,transform] duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
};
