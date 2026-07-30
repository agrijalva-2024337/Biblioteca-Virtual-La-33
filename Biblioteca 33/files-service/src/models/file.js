import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  title: String,

  description: String,

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },

  /**
   * Año académico del recurso (p. ej. 2025).
   * Distinto de createdAt (fecha/hora de subida al sistema).
   */
  promotionYear: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100,
  },

  fileUrl: String,

  originalName: String,

  sizeBytes: Number,

  mimeType: String,

  uploadedBy: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  reason: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("File", FileSchema);
