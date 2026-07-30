import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Logo } from '../../../shared/components/ui/Logo.jsx';
import { LandingBook } from '../components/LandingBook.jsx';

const STEPS = [
  {
    num: '01',
    title: 'Explora por grado y asignatura',
    body: 'Entra a carpetas claras: el material aparece ordenado por año y materia, sin listas interminables.',
  },
  {
    num: '02',
    title: 'Comparte tus apuntes',
    body: 'Desde la app móvil subes recursos con grado y año académico. Todo llega al flujo de revisión.',
  },
  {
    num: '03',
    title: 'IA + criterio humano',
    body: 'La IA sugiere si es material de apoyo o tarea resuelta. Cuando hay duda, un docente decide.',
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToHow = () => {
    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page relative h-full min-h-0 w-full overflow-y-auto overscroll-y-contain">
      {/* Fondo fijo: foto visible en el hero; overlays se refuerzan hacia abajo */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/library-bg.png')" }}
        />
        <div className="landing-bg-veil absolute inset-0" />
        <div className="landing-bg-vignette absolute inset-0" />
        <div className="bg-grain absolute inset-0 opacity-[0.05]" />
        <div className="landing-orb landing-orb-a" />
        <div className="landing-orb landing-orb-b" />
      </div>

      <header className="landing-nav sticky top-0 z-20 flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Logo size="sm" className="landing-nav-logo" />
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            className="!min-h-10 !px-4 !text-sm"
            onClick={() => navigate('/login')}
          >
            Entrar
          </Button>
          <Button
            type="button"
            className="!min-h-10 !px-4 !text-sm"
            onClick={() => navigate('/register')}
          >
            Registro
          </Button>
        </div>
      </header>

      {/* HERO — una composición, marca primero */}
      <section className="landing-hero relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center px-4 pb-24 pt-6 text-center sm:px-8">
        <div className="landing-title flex max-w-3xl flex-col items-center">
          <Logo size="hero" className="landing-logo-glow mb-5 justify-center sm:mb-7" />
          <h1 className="font-display text-[clamp(3.25rem,11vw,6.5rem)] font-extrabold leading-[0.9] tracking-tight text-[var(--text-h)]">
            La 33
          </h1>
          <p className="mt-4 max-w-lg text-[clamp(1.05rem,2.4vw,1.4rem)] font-medium tracking-wide text-[var(--text)]">
            Biblioteca Estudiantil Online
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Materiales por grado, aportes de estudiantes y moderación con criterio.
          </p>
        </div>

        <div className="landing-cta mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" className="w-full sm:min-w-[12rem]" onClick={() => navigate('/login')}>
            Iniciar sesión
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:min-w-[12rem]"
            onClick={() => navigate('/register')}
          >
            Registrarme
          </Button>
        </div>

        <button
          type="button"
          onClick={scrollToHow}
          className="landing-scroll-hint absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[var(--text-muted)] transition hover:text-[var(--accent)]"
          aria-label="Bajar a cómo funciona"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">Explorar</span>
          <span className="landing-chevron text-2xl leading-none text-[var(--accent)]">↓</span>
        </button>
      </section>

      {/* Cómo funciona */}
      <section
        id="como-funciona"
        className="landing-section relative border-t border-[var(--border)]/40 px-4 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              Cómo funciona
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight text-[var(--text-h)] sm:text-5xl">
              Hecha para el ritmo del campus
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Un solo lugar para encontrar, compartir y cuidar el material académico de La 33.
            </p>

            <ol className="mt-12 space-y-10">
              {STEPS.map((step) => (
                <li key={step.num} className="landing-step group flex gap-5 sm:gap-8">
                  <span className="font-display shrink-0 text-4xl font-extrabold tabular-nums text-[var(--accent)] sm:text-5xl">
                    {step.num}
                  </span>
                  <div className="min-w-0 pt-1">
                    <h3 className="font-display text-xl font-semibold text-[var(--text-h)] sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="landing-shelf relative mx-auto flex h-64 w-full max-w-md items-end justify-center gap-3 sm:h-80 lg:max-w-none">
            <div className="landing-shelf-glow absolute inset-x-8 bottom-0 h-24 rounded-full bg-[var(--accent)]/20 blur-3xl" />
            <div className="landing-book-float landing-book-float-1 relative z-[1] h-44 w-16 sm:h-56 sm:w-20">
              <LandingBook colorIndex={1} titleMark="4°" />
            </div>
            <div className="landing-book-float landing-book-float-2 relative z-[2] h-52 w-[4.5rem] sm:h-64 sm:w-24">
              <LandingBook colorIndex={0} titleMark="33" />
            </div>
            <div className="landing-book-float landing-book-float-3 relative z-[1] h-40 w-16 sm:h-52 sm:w-20">
              <LandingBook colorIndex={2} titleMark="5°" />
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="landing-section relative px-4 pb-16 pt-8 sm:px-8 sm:pb-24">
        <div className="landing-finale mx-auto max-w-3xl border-t border-[var(--border)]/50 pt-14 text-center">
          <h2 className="font-display text-3xl font-bold text-[var(--text-h)] sm:text-4xl">
            Empieza en La 33
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-muted)] sm:text-base">
            Entrá con tu cuenta institucional o registrate para sumar material a la biblioteca.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button type="button" className="w-full max-w-xs sm:w-auto" onClick={() => navigate('/login')}>
              Iniciar sesión
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full max-w-xs sm:w-auto"
              onClick={() => navigate('/register')}
            >
              Crear cuenta
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)]/30 px-4 py-8 text-center">
        <Logo size="sm" className="mx-auto mb-3 justify-center opacity-75" />
        <p className="text-xs text-[var(--text-muted)]">La 33 · Biblioteca Estudiantil Online</p>
      </footer>
    </div>
  );
};
