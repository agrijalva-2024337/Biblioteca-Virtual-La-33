import mongoose from "mongoose";

/**
 * Grado administrable (ej. "4to", "5to", "6to grado").
 * Subject.grade guarda este `name` como String (mismo patrón simple que assignedTeachers),
 * no un ObjectId — evita migración masiva de documentos existentes.
 */
const GradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

GradeSchema.index({ order: 1 });

export default mongoose.model("Grade", GradeSchema);
