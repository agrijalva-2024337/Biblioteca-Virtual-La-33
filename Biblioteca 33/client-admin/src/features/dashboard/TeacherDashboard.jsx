import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { getSubjects } from '../../shared/api/files.js';
import { getGradeLabel } from '../../shared/constants/grades.js';
import { Spinner } from '../auth/components/Spinner.jsx';
import { ErrorBanner } from '../../shared/components/ui/ErrorBanner.jsx';

const getUserId = (user) => user?.id || user?.Id || user?.userId || '';

export const TeacherDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const name = user?.username || user?.name || 'docente';
  const teacherId = getUserId(user);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubjects = useCallback(async () => {
    if (!teacherId) {
      setSubjects([]);
      setLoading(false);
      setError('No se pudo identificar tu usuario para cargar materias.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getSubjects({ teacherId });
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setSubjects(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar tus materias asignadas');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  return (
    <div className="animate-fadeIn space-y-8">
      <section className="welcome-banner relative overflow-hidden border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--accent-dark)] via-[var(--accent)]/85 to-[color-mix(in_srgb,var(--accent)_40%,#3a2414)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/75">
            Panel docente
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ¡Bienvenido de nuevo, {name}!
          </h1>
          <p className="mt-3 text-sm text-white/85 sm:text-base">
            Entra a una de tus materias asignadas para ver sus materiales.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[var(--text-h)]">Mis materias</h2>
          <Link
            to="/teacher/materiales"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Ver todos los materiales
          </Link>
        </div>

        <ErrorBanner message={error} />

        {loading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <Spinner />
          </div>
        ) : subjects.length === 0 ? (
          <p className="border border-[var(--border)] bg-[var(--bg-card)]/70 px-5 py-8 text-center text-sm text-[var(--text-muted)]">
            Aún no tienes materias asignadas. Un administrador debe asignártelas en Asignaturas y
            Grados.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/teacher/materias/${subject._id}`}
                state={{ subjectName: subject.name, subjectGrade: subject.grade }}
                className="group aspect-square border border-[var(--border)] bg-[var(--bg-card)]/80 p-4 backdrop-blur-md transition hover:border-[var(--accent)] hover:bg-[rgba(232,132,43,0.12)]"
              >
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <AcademicCapIcon className="h-10 w-10 text-[var(--accent)] transition group-hover:scale-105 sm:h-12 sm:w-12" />
                  <span className="font-semibold leading-tight text-[var(--text-h)]">
                    {subject.name}
                  </span>
                  {subject.grade ? (
                    <span className="text-xs text-[var(--text-muted)]">
                      {getGradeLabel(subject.grade)}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
