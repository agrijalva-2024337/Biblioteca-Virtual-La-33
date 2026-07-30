import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  FolderIcon,
  PencilSquareIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  assignSubjectTeachers,
  createGrade,
  createSubject,
  getGrades,
  getSubjects,
  updateSubject,
} from '../../../shared/api/files';
import { getUsersByRole } from '../../../shared/api/auth.js';
import { TEACHER_ROLE } from '../../../shared/utils/roles.js';
import { getGradeLabel, gradesToOptions } from '../../../shared/constants/grades.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { PageHeader } from '../../../shared/components/ui/PageHeader.jsx';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Select } from '../../../shared/components/ui/Select.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { Modal } from '../../../shared/components/ui/Modal.jsx';
import { ErrorBanner } from '../../../shared/components/ui/ErrorBanner.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import {
  formatApiError,
  getTeacherId,
  getTeacherLabel,
  normalizeSubjects,
} from '../utils/subjectsHelpers.js';

export const SubjectsPanel = ({ canCreate = false }) => {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [activeGrade, setActiveGrade] = useState(null);
  const [error, setError] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSubject, setAssignSubject] = useState(null);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeOrder, setNewGradeOrder] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const gradeOptions = useMemo(() => gradesToOptions(grades), [grades]);

  const teachersById = useMemo(() => {
    const map = new Map();
    for (const teacher of teachers) {
      const id = getTeacherId(teacher);
      if (id) map.set(id, teacher);
    }
    return map;
  }, [teachers]);

  const fetchGrades = useCallback(async () => {
    try {
      const list = await getGrades();
      setGrades(list);
      setGrade((prev) => {
        if (prev) return prev;
        return list[0]?.name || '';
      });
    } catch (err) {
      console.warn('No se pudieron cargar grados:', err);
      setGrades([]);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSubjects();
      setSubjects(normalizeSubjects(response));
    } catch (err) {
      const message = formatApiError(err, 'Error al cargar asignaturas');
      setError(message);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    if (!canCreate) return;
    try {
      const { users } = await getUsersByRole(TEACHER_ROLE);
      setTeachers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.warn('No se pudieron cargar docentes:', err);
      setTeachers([]);
    }
  }, [canCreate]);

  useEffect(() => {
    fetchGrades();
    fetchSubjects();
  }, [fetchGrades, fetchSubjects]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const grouped = useMemo(() => {
    const map = {};
    for (const option of gradeOptions) {
      map[option.value] = [];
    }
    for (const subject of subjects) {
      const key = subject.grade || '_other';
      if (!map[key]) {
        if (!map._other) map._other = [];
        if (gradeOptions.some((g) => g.value === key)) {
          map[key] = map[key] || [];
          map[key].push(subject);
        } else {
          map._other.push(subject);
        }
      } else {
        map[key].push(subject);
      }
    }
    return map;
  }, [subjects, gradeOptions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !grade) return;

    setSaving(true);
    setError(null);
    try {
      const created = await createSubject({ name: trimmed, grade });
      setName('');
      showSuccess(`Asignatura creada en ${getGradeLabel(grade)}`);
      setActiveGrade(grade);
      setSubjects((prev) => {
        const id = created?._id;
        if (id && prev.some((s) => s._id === id)) return prev;
        return [...prev, created];
      });
      await fetchSubjects();
    } catch (err) {
      const message = formatApiError(err, 'Error al crear la asignatura');
      setError(message);
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGrade = async (e) => {
    e.preventDefault();
    const trimmed = newGradeName.trim();
    if (!trimmed) return;

    setSavingGrade(true);
    try {
      const orderValue =
        newGradeOrder === '' ? undefined : Number.parseInt(newGradeOrder, 10);
      const created = await createGrade({
        name: trimmed,
        order: Number.isFinite(orderValue) ? orderValue : undefined,
      });
      showSuccess(`Grado "${created.name}" creado`);
      setNewGradeName('');
      setNewGradeOrder('');
      setGradeModalOpen(false);
      await fetchGrades();
      setGrade(created.name);
      setActiveGrade(created.name);
    } catch (err) {
      showError(formatApiError(err, 'Error al crear el grado'));
    } finally {
      setSavingGrade(false);
    }
  };

  const openEditModal = (subject) => {
    setEditSubject(subject);
    setEditName(subject.name || '');
    setEditGrade(subject.grade || gradeOptions[0]?.value || '');
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditSubject(null);
    setEditName('');
    setEditGrade('');
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    if (!editSubject?._id) return;
    const trimmed = editName.trim();
    if (!trimmed || !editGrade) return;

    setSavingEdit(true);
    try {
      const updated = await updateSubject(editSubject._id, {
        name: trimmed,
        grade: editGrade,
      });
      setSubjects((prev) =>
        prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s))
      );
      showSuccess('Asignatura actualizada');
      closeEditModal();
    } catch (err) {
      showError(formatApiError(err, 'Error al editar la asignatura'));
    } finally {
      setSavingEdit(false);
    }
  };

  const openAssignModal = (subject) => {
    setAssignSubject(subject);
    setSelectedTeacherIds(
      Array.isArray(subject.assignedTeachers) ? [...subject.assignedTeachers] : []
    );
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setAssignSubject(null);
    setSelectedTeacherIds([]);
  };

  const toggleTeacherSelection = (teacherId) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleAssignTeachers = async () => {
    if (!assignSubject?._id) return;

    setAssigning(true);
    try {
      const updated = await assignSubjectTeachers(assignSubject._id, selectedTeacherIds);
      setSubjects((prev) =>
        prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s))
      );
      showSuccess(
        selectedTeacherIds.length === 0
          ? 'Sin docentes asignados'
          : `${selectedTeacherIds.length} docente(s) asignado(s)`
      );
      closeAssignModal();
    } catch (err) {
      showError(formatApiError(err, 'Error al asignar docentes'));
    } finally {
      setAssigning(false);
    }
  };

  const renderTeacherLabels = (subject) => {
    const ids = Array.isArray(subject.assignedTeachers) ? subject.assignedTeachers : [];
    if (ids.length === 0) {
      return <span className="text-[var(--text-muted)]">Sin asignar</span>;
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const teacher = teachersById.get(id);
          return (
            <span
              key={id}
              className="inline-flex rounded-md border border-[var(--border)] bg-[var(--bg-alt)] px-2 py-0.5 text-xs text-[var(--text-h)]"
              title={id}
            >
              {teacher ? getTeacherLabel(teacher) : `${id.slice(0, 8)}…`}
            </span>
          );
        })}
      </div>
    );
  };

  if (loading && subjects.length === 0 && grades.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const foldersToShow = activeGrade
    ? gradeOptions.filter((g) => g.value === activeGrade)
    : gradeOptions;

  return (
    <div>
      <PageHeader
        title="Asignaturas y Grados"
        subtitle={
          canCreate
            ? 'Crea grados, organiza asignaturas y asigna docentes a cada materia.'
            : 'Consulta las carpetas de asignaturas por grado'
        }
        action={
          <div className="flex flex-wrap gap-2">
            {canCreate && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setGradeModalOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Nuevo grado
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                fetchGrades();
                fetchSubjects();
                fetchTeachers();
              }}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        }
      />

      <ErrorBanner message={error} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gradeOptions.map((option) => {
          const count = grouped[option.value]?.length || 0;
          const isActive = activeGrade === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setActiveGrade((prev) => (prev === option.value ? null : option.value))
              }
              className={`
                flex items-center gap-4 rounded-[var(--radius-card)] border px-5 py-4 text-left transition
                ${
                  isActive
                    ? 'border-[var(--accent)] bg-[rgba(232,132,43,0.12)]'
                    : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]'
                }
              `}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-alt)]">
                <FolderIcon className="h-6 w-6 text-[var(--accent)]" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-[var(--text-h)]">{option.label}</span>
                <span className="text-sm text-[var(--text-muted)]">
                  {count} asignatura{count === 1 ? '' : 's'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {canCreate && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <Input
              label="Nueva asignatura"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Matemáticas"
              required
            />
            <Select
              label="Grado"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            >
              {gradeOptions.length === 0 ? (
                <option value="">Sin grados</option>
              ) : (
                gradeOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))
              )}
            </Select>
            <Button type="submit" disabled={saving || !grade} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Crear'}
            </Button>
          </form>
        </Card>
      )}

      {foldersToShow.map((option) => {
        const list = grouped[option.value] || [];
        return (
          <div key={option.value} className="mb-8">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-[var(--text-h)]">
              <FolderIcon className="h-5 w-5 text-[var(--accent)]" />
              {option.label}
            </h3>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)]">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-[var(--text-muted)]">Nombre</th>
                    <th className="px-5 py-4 font-semibold text-[var(--text-muted)]">Grado</th>
                    {canCreate && (
                      <th className="px-5 py-4 font-semibold text-[var(--text-muted)]">Docentes</th>
                    )}
                    {canCreate && (
                      <th className="px-5 py-4 font-semibold text-[var(--text-muted)]">Acciones</th>
                    )}
                    {!canCreate && (
                      <th className="px-5 py-4 font-semibold text-[var(--text-muted)]">ID</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {list.map((subject) => (
                    <tr
                      key={subject._id}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-hover)]"
                    >
                      <td className="px-5 py-4 font-medium text-[var(--text-h)]">{subject.name}</td>
                      <td className="px-5 py-4 text-[var(--text-muted)]">
                        {getGradeLabel(subject.grade)}
                      </td>
                      {canCreate && (
                        <td className="px-5 py-4">{renderTeacherLabels(subject)}</td>
                      )}
                      {canCreate && (
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              className="!px-3 !py-2 text-xs"
                              onClick={() => openEditModal(subject)}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              className="!px-3 !py-2 text-xs"
                              onClick={() => openAssignModal(subject)}
                            >
                              <UserGroupIcon className="h-4 w-4" />
                              Asignar
                            </Button>
                          </div>
                        </td>
                      )}
                      {!canCreate && (
                        <td className="px-5 py-4 text-[var(--text-muted)]">{subject._id}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {list.length === 0 && (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  No hay asignaturas en {option.label}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {grouped._other?.length > 0 && !activeGrade && (
        <div className="mb-8">
          <h3 className="mb-3 font-display text-lg font-semibold text-[var(--text-h)]">
            Sin grado asignado (datos previos)
          </h3>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)]">
            <table className="min-w-full text-left text-sm">
              <tbody>
                {grouped._other.map((subject) => (
                  <tr
                    key={subject._id}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    <td className="px-5 py-4 font-medium text-[var(--text-h)]">{subject.name}</td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">{subject._id}</td>
                    {canCreate && (
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="!px-3 !py-2 text-xs"
                            onClick={() => openEditModal(subject)}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="!px-3 !py-2 text-xs"
                            onClick={() => openAssignModal(subject)}
                          >
                            Asignar
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        title="Nuevo grado"
        subtitle="Se agregará al catálogo y podrás usarlo al crear asignaturas."
      >
        <form onSubmit={handleCreateGrade} className="space-y-4">
          <Input
            label="Nombre"
            value={newGradeName}
            onChange={(e) => setNewGradeName(e.target.value)}
            placeholder="Ej: 6to grado"
            required
          />
          <Input
            label="Orden (opcional)"
            type="number"
            min={0}
            value={newGradeOrder}
            onChange={(e) => setNewGradeOrder(e.target.value)}
            placeholder="Ej: 6"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setGradeModalOpen(false)}
              disabled={savingGrade}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={savingGrade}>
              {savingGrade ? 'Guardando...' : 'Crear grado'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        title="Editar asignatura"
        subtitle={editSubject ? getGradeLabel(editSubject.grade) : undefined}
      >
        <form onSubmit={handleEditSubject} className="space-y-4">
          <Input
            label="Nombre"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Select
            label="Grado"
            value={editGrade}
            onChange={(e) => setEditGrade(e.target.value)}
            required
          >
            {gradeOptions.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeEditModal} disabled={savingEdit}>
              Cancelar
            </Button>
            <Button type="submit" disabled={savingEdit}>
              {savingEdit ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={assignModalOpen}
        onClose={closeAssignModal}
        title="Asignar docentes"
        subtitle={
          assignSubject
            ? `${assignSubject.name} · ${getGradeLabel(assignSubject.grade) || 'Sin grado'}`
            : undefined
        }
        maxWidth="max-w-xl"
      >
        {teachers.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No hay docentes registrados. Crea usuarios con rol Docente en Usuarios.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="mb-3 text-sm text-[var(--text-muted)]">
              Selecciona uno o más docentes. Al guardar se reemplaza la lista completa.
            </p>
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {teachers.map((teacher) => {
                const id = getTeacherId(teacher);
                const checked = selectedTeacherIds.includes(id);
                return (
                  <li key={id}>
                    <label
                      className={`
                        flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition
                        ${
                          checked
                            ? 'border-[var(--accent)] bg-[rgba(232,132,43,0.12)]'
                            : 'border-[var(--border)] bg-[var(--bg-alt)] hover:bg-[var(--bg-hover)]'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTeacherSelection(id)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-[var(--text-h)]">
                          {getTeacherLabel(teacher)}
                        </span>
                        <span className="block truncate text-xs text-[var(--text-muted)]">
                          {teacher.email || id}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={closeAssignModal} disabled={assigning}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleAssignTeachers} disabled={assigning}>
            {assigning ? 'Guardando...' : 'Guardar asignación'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
