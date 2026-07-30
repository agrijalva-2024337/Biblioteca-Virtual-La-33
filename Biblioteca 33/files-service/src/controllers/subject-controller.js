import Subject from "../models/subject.js";
import { coerceLegacyGrade, normalizeGradeName } from "../constants/grades.js";
import { resolveGradeName } from "./grade-controller.js";

export const createSubject = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const grade = await resolveGradeName(req.body.grade);

    console.log("[subjects] create payload:", {
      name,
      gradeRaw: req.body.grade,
      gradeResolved: grade,
    });

    if (!grade) {
      return res.status(400).json({
        success: false,
        message: "El grado es requerido y debe existir en el catálogo de grados",
        error: "INVALID_GRADE",
      });
    }

    const subject = await Subject.create({ name, grade, assignedTeachers: [] });

    console.log("[subjects] created:", {
      id: subject._id.toString(),
      name: subject.name,
      grade: subject.grade,
    });

    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const gradeQuery = normalizeGradeName(req.query.grade);
    const teacherId = String(req.query.teacherId || "").trim();
    const filter = {};

    if (gradeQuery) {
      const resolved = await resolveGradeName(gradeQuery);
      filter.grade = resolved || coerceLegacyGrade(gradeQuery) || gradeQuery;
    }

    if (teacherId) {
      filter.assignedTeachers = teacherId;
    }

    console.log("[subjects] list filter:", filter);

    const subjects = await Subject.find(filter).sort({ grade: 1, name: 1 });

    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

/**
 * Reemplaza por completo el array assignedTeachers de una asignatura.
 * Body: { teacherIds: string[] }
 */
export const assignTeachers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawIds = Array.isArray(req.body.teacherIds) ? req.body.teacherIds : [];

    const teacherIds = [
      ...new Set(
        rawIds
          .map((idValue) => String(idValue || "").trim())
          .filter(Boolean)
      ),
    ];

    const subject = await Subject.findByIdAndUpdate(
      id,
      { assignedTeachers: teacherIds },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Asignatura no encontrada",
        error: "SUBJECT_NOT_FOUND",
      });
    }

    console.log("[subjects] teachers assigned:", {
      id: subject._id.toString(),
      teacherIds: subject.assignedTeachers,
    });

    res.json(subject);
  } catch (error) {
    next(error);
  }
};

/**
 * Edita nombre y/o grado de una asignatura.
 * Body: { name?, grade? } — al menos uno requerido.
 */
export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name || "").trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "El nombre no puede estar vacío",
          error: "INVALID_NAME",
        });
      }
      updates.name = name;
    }

    if (req.body.grade !== undefined) {
      const grade = await resolveGradeName(req.body.grade);
      if (!grade) {
        return res.status(400).json({
          success: false,
          message: "El grado debe existir en el catálogo de grados",
          error: "INVALID_GRADE",
        });
      }
      updates.grade = grade;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar name y/o grade para actualizar",
        error: "EMPTY_UPDATE",
      });
    }

    const subject = await Subject.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Asignatura no encontrada",
        error: "SUBJECT_NOT_FOUND",
      });
    }

    res.json(subject);
  } catch (error) {
    next(error);
  }
};
