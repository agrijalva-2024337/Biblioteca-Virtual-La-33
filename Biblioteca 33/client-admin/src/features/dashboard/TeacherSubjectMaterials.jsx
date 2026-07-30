import { Link, useLocation, useParams } from 'react-router-dom';
import { MaterialsList } from '../materials/components/MaterialsList.jsx';
import { getGradeLabel } from '../../shared/constants/grades.js';

export const TeacherSubjectMaterials = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const subjectName = location.state?.subjectName;
  const subjectGrade = location.state?.subjectGrade;

  const title = [subjectName, subjectGrade ? getGradeLabel(subjectGrade) : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div>
      <div className="mb-4">
        <Link to="/teacher/inicio" className="text-sm text-[var(--accent)] hover:underline">
          ← Volver a mis materias
        </Link>
      </div>
      <MaterialsList
        readOnly
        lockedSubjectId={subjectId}
        subjectTitle={title || 'Materiales de la materia'}
      />
    </div>
  );
};
