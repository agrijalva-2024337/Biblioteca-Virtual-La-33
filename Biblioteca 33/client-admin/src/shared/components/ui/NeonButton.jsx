export const NeonButton = ({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: 'neon-btn--primary',
    secondary: 'neon-btn--secondary',
    success: 'neon-btn--success',
    danger: 'neon-btn--danger',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        neon-btn
        ${variants[variant] || variants.primary}
        ${disabled ? 'neon-btn--disabled' : ''}
        ${className}
      `}
    >
      {!disabled && (
        <>
          <span className="neon-btn__line neon-btn__line--top" aria-hidden="true" />
          <span className="neon-btn__line neon-btn__line--right" aria-hidden="true" />
          <span className="neon-btn__line neon-btn__line--bottom" aria-hidden="true" />
          <span className="neon-btn__line neon-btn__line--left" aria-hidden="true" />
        </>
      )}
      <span className="neon-btn__label">{children}</span>
    </button>
  );
};
