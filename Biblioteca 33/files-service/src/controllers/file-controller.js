import axios from "axios";
import File from "../models/file.js";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:3001/IA-OCR-Service/v1";

const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

export const uploadFile = async (req, res, next) => {
  try {

    const { title, description, subject, promotionYear } = req.body;

    const file = await File.create({
      title,
      description,
      subject,
      promotionYear: Number(promotionYear),
      fileUrl: req.file.path,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id
    });

    try {

      await axios.post(
        `${AI_SERVICE_URL}/pipeline/process-file`,
        {
          fileId: file._id,
          uploadedBy: file.uploadedBy,
          fileURL: file.fileUrl,
          title: file.title,
          originalName: file.originalName,
          subjectId: file.subject ? String(file.subject) : undefined,
        },
        {
          headers: { "x-internal-key": INTERNAL_SERVICE_KEY }
        }
      );

    } catch (error) {

      // No tumba la subida: el archivo queda pending para revisión
      console.error("AI service error:", error.message);

    }

    res.json(file);

  } catch (error) {

    console.error("[upload] File.create failed:", error.message);
    next(error);

  }
};

const isStudent = (req) => req.user?.role === "USER_ROLE";

export const getFiles = async (req, res, next) => {
  try {

    const { status, subject, q, promotionYear } = req.query;

    // Construir el filtro dinamicamente solo con los params presentes
    const filter = {};

    // Estudiantes solo ven material aprobado (salvo sus propios uploads vía /my-files)
    if (isStudent(req)) {
      filter.status = "approved";
    } else if (status) {
      filter.status = status;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    if (promotionYear) {
      filter.promotionYear = Number(promotionYear);
    }

    const files = await File.find(filter).populate("subject").sort({ promotionYear: -1, createdAt: -1 });
    res.json(files);

  } catch (error) {

    next(error);

  }
};

export const getFileById = async (req, res, next) => {
  try {

    const file = await File.findById(req.params.id).populate("subject");

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Archivo no encontrado"
      });
    }

    if (
      isStudent(req) &&
      file.status !== "approved" &&
      String(file.uploadedBy) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para ver este archivo"
      });
    }

    res.json(file);

  } catch (error) {

    next(error);

  }
};

export const getMyFiles = async (req, res, next) => {
  try {

    const files = await File.find({ uploadedBy: req.user.id })
      .populate("subject")
      .sort({ createdAt: -1 });

    res.json(files);

  } catch (error) {

    next(error);

  }
};

export const searchFiles = async (req, res, next) => {
  try {

    const { q } = req.query;

    const filter = {
      title: { $regex: q, $options: "i" }
    };

    if (isStudent(req)) {
      filter.status = "approved";
    }

    const files = await File.find(filter).populate("subject");

    res.json(files);

  } catch (error) {

    next(error);

  }
};

export const updateFileStatus = async (req, res, next) => {
  try {

    const { id } = req.params;
    const { status, reason } = req.body;

    const update = { status };

    if (status === "rejected" && reason) {
      update.reason = reason;
    }

    const file = await File.findByIdAndUpdate(id, update, { new: true });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Archivo no encontrado"
      });
    }

    res.json({
      success: true,
      message: "Estado del archivo actualizado",
      file
    });

  } catch (error) {

      next(error);

  }
};