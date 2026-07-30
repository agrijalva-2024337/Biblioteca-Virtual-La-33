import Grade from "../models/grade.js";
import { coerceLegacyGrade, normalizeGradeName } from "../constants/grades.js";

export const listGrades = async (_req, res, next) => {
  try {
    const grades = await Grade.find().sort({ order: 1, name: 1 });
    res.json(grades);
  } catch (error) {
    next(error);
  }
};

export const createGrade = async (req, res, next) => {
  try {
    const name = normalizeGradeName(req.body.name);
    const orderRaw = req.body.order;
    const order =
      orderRaw === undefined || orderRaw === null || orderRaw === ""
        ? 0
        : Number(orderRaw);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "El nombre del grado es requerido",
        error: "INVALID_GRADE_NAME",
      });
    }

    if (Number.isNaN(order)) {
      return res.status(400).json({
        success: false,
        message: "El orden debe ser un número",
        error: "INVALID_GRADE_ORDER",
      });
    }

    const existing = await Grade.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Ya existe un grado con el nombre "${name}"`,
        error: "GRADE_EXISTS",
      });
    }

    const grade = await Grade.create({ name, order });
    res.status(201).json(grade);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un grado con ese nombre",
        error: "GRADE_EXISTS",
      });
    }
    next(error);
  }
};

/** Resuelve un nombre de grado contra la colección (con coerce legado). */
export const resolveGradeName = async (raw) => {
  const coerced = coerceLegacyGrade(raw);
  if (!coerced) return null;
  const found = await Grade.findOne({ name: coerced });
  if (found) return found.name;
  // Intento exacto sin coerce (por si el admin creó "4to grado" literal)
  const exact = await Grade.findOne({ name: normalizeGradeName(raw) });
  return exact ? exact.name : null;
};
