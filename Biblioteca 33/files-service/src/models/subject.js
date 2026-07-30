import mongoose from "mongoose";

/**
 * Subject.grade almacena Grade.name (String), no ObjectId.
 * Validación de existencia se hace en controllers/validators contra la colección Grade.
 */
const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  grade: {
    type: String,
    trim: true,
  },
  /**
   * IDs de usuarios (auth-service) con rol docente asignados a esta materia.
   * Mismo patrón String plano que File.uploadedBy / Moderation.reviewedBy.
   */
  assignedTeachers: {
    type: [String],
    default: [],
  },
});

SubjectSchema.index({ grade: 1, name: 1 });
SubjectSchema.index({ assignedTeachers: 1 });

export default mongoose.model("Subject", SubjectSchema);
