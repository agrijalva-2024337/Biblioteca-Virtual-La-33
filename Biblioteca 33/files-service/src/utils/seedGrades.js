import Grade from "../models/grade.js";

/** Semillas iniciales — coinciden con Subject.grade legado ("4to" / "5to"). */
const DEFAULT_GRADES = [
  { name: "4to", order: 4 },
  { name: "5to", order: 5 },
];

/**
 * Inserta los grados base si no existen.
 * No borra ni reescribe grados creados después por el admin.
 */
export const seedGrades = async () => {
  for (const grade of DEFAULT_GRADES) {
    await Grade.updateOne(
      { name: grade.name },
      { $setOnInsert: grade },
      { upsert: true }
    );
  }
  console.log("[grades] seed listo (4to, 5to)");
};
