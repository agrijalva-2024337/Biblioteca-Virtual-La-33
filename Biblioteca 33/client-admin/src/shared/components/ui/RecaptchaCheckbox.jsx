import { useEffect, useRef, useState } from 'react';

const SCRIPT_ID = 'google-recaptcha-v2-script';
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const IS_DEV = import.meta.env.DEV;

/**
 * Checkbox Google reCAPTCHA v2.
 * - Con site key: renderiza el widget.
 * - Sin site key en DEV: aviso de configuración (nombres de env).
 * - Sin site key en producción: mensaje genérico (no expone nombres de variables).
 */
export const RecaptchaCheckbox = ({ onChange, className = '' }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [ready, setReady] = useState(Boolean(window.grecaptcha?.render));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!SITE_KEY) {
      onChange?.('');
      return undefined;
    }

    const notifyReady = () => setReady(true);

    if (window.grecaptcha?.render) {
      notifyReady();
      return undefined;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      window.__onRecaptchaLoadCallbacks = window.__onRecaptchaLoadCallbacks || [];
      window.__onRecaptchaLoadCallbacks.push(notifyReady);
      return undefined;
    }

    window.__onRecaptchaLoadCallbacks = [notifyReady];
    window.__onRecaptchaApiLoad = () => {
      (window.__onRecaptchaLoadCallbacks || []).forEach((cb) => cb());
      window.__onRecaptchaLoadCallbacks = [];
    };

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src =
      'https://www.google.com/recaptcha/api.js?onload=__onRecaptchaApiLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = () => setError('No se pudo cargar reCAPTCHA');
    document.head.appendChild(script);

    return undefined;
  }, [onChange]);

  useEffect(() => {
    if (!SITE_KEY || !ready || !containerRef.current || !window.grecaptcha?.render) {
      return undefined;
    }

    if (widgetIdRef.current != null) {
      return undefined;
    }

    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: (token) => onChange?.(token),
        'expired-callback': () => onChange?.(''),
        'error-callback': () => {
          onChange?.('');
          setError('Error en reCAPTCHA. Recarga e inténtalo de nuevo.');
        },
      });
    } catch (err) {
      setError(err.message || 'No se pudo inicializar reCAPTCHA');
    }

    return undefined;
  }, [ready, onChange]);

  if (!SITE_KEY) {
    if (IS_DEV) {
      return (
        <p className={`text-xs text-[var(--text-muted)] ${className}`}>
          reCAPTCHA desactivado (falta VITE_RECAPTCHA_SITE_KEY). El backend también debe
          tener RecaptchaSettings:Enabled=false.
        </p>
      );
    }

    return (
      <p className={`text-sm text-[var(--danger)] text-center ${className}`}>
        La verificación de seguridad no está disponible. Intenta más tarde.
      </p>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="flex justify-center" />
      {error ? <p className="mt-2 text-center text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
};

export const isRecaptchaConfigured = () => Boolean(SITE_KEY);

/** En producción sin site key el login/registro deben bloquearse. */
export const isRecaptchaBlockingSubmit = () => !SITE_KEY && !IS_DEV;
