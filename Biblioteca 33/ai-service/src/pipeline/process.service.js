import axios from "axios";
import fs from "fs";
import path from "path";
import {
  extractTextFromPDF,
  extractTextFromImage,
  extractTextFromImageBuffer,
  extractTextFromScannedPDF,
  isWeakExtract,
} from "../ocr/ocr.service.js";
import { analyzeText } from "../ai/ai.service.js";
import { prepareTextForAnalysis } from "../ai/heuristics.js";

const MODERATION_URL =
  process.env.MODERATION_URL ||
  "http://localhost:3000/Biblioteca/v1/moderations";

const FILES_SERVICE_URL =
  process.env.FILES_SERVICE_URL || "http://localhost:3003";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL ||
  "http://localhost:3005/Biblioteca/v1/notifications/internal/file-status";

const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

/** Solo auto-aprueba/rechaza si la confianza es alta; si no → moderación humana. */
const AUTO_DECISION_MIN_CONFIDENCE = Number(
  process.env.AI_AUTO_DECISION_MIN_CONFIDENCE || 0.78
);

const updateFileStatus = async (fileId, status, reason) => {
  try {
    await axios.patch(
      `${FILES_SERVICE_URL}/files/${fileId}/status`,
      { status, ...(reason ? { reason } : {}) },
      {
        headers: { "x-internal-key": INTERNAL_SERVICE_KEY },
        timeout: 15000,
      }
    );
  } catch (err) {
    console.error(
      `Error actualizando estado del archivo ${fileId} en files-service:`,
      err.message
    );
  }
};

const notifyStudent = async ({ userId, fileId, status, reason }) => {
  try {
    await axios.post(
      NOTIFICATION_SERVICE_URL,
      { userId, fileId, status, ...(reason ? { reason } : {}) },
      {
        headers: { "x-internal-key": INTERNAL_SERVICE_KEY },
        timeout: 15000,
      }
    );
  } catch (err) {
    console.error(
      `Error notificando al estudiante (fileId ${fileId}) en notification-service:`,
      err.message
    );
  }
};

const isImage = (contentType, fileURL) => {
  if (contentType.includes("image")) return true;
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileURL || "");
};

const isPDF = (contentType, buffer) => {
  if (contentType.includes("pdf")) return true;
  return buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50;
};

const parseAIResult = (raw) => {
  if (raw && typeof raw === "object" && raw.classification) {
    return {
      classification: raw.classification,
      confidence: Number(raw.confidence) || 0,
      reason: raw.reason || "Sin explicación.",
      evidence: raw.evidence || [],
      source: raw.source || "unknown",
      signals: raw.signals,
    };
  }

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      classification: parsed?.classification || "incierto",
      confidence: Number(parsed?.confidence) || 0.4,
      reason: parsed?.reason || "La IA no proporcionó explicación.",
      evidence: parsed?.evidence || [],
      source: "legacy",
    };
  } catch {
    return {
      classification: "incierto",
      confidence: 0.2,
      reason: "No se pudo interpretar la respuesta de la IA.",
      evidence: [],
      source: "parse_error",
    };
  }
};

const sendToModeration = async ({
  fileId,
  uploadedBy,
  fileURL,
  title,
  originalName,
  subjectId,
  aiResult,
}) => {
  const payload = {
    fileId,
    uploadedBy: uploadedBy || "anonymous",
    fileURL,
    title,
    originalName,
    subjectId: subjectId ? String(subjectId) : undefined,
    aiClassification: aiResult.classification,
    aiReason: aiResult.reason,
    aiScore: aiResult.confidence,
  };

  const modRes = await axios.post(MODERATION_URL, payload, {
    headers: { "x-internal-key": INTERNAL_SERVICE_KEY },
    timeout: 15000,
    validateStatus: () => true,
  });

  if (modRes.status >= 200 && modRes.status < 300) {
    return modRes.data;
  }

  console.error(
    `Error enviando a Moderation Service: HTTP ${modRes.status}`,
    typeof modRes.data === "object" ? JSON.stringify(modRes.data) : modRes.data
  );
  return null;
};

const extractDocumentText = async ({ buffer, contentType, fileURL }) => {
  let text = "";

  if (isPDF(contentType, buffer)) {
    text = await extractTextFromPDF(buffer);
    if (isWeakExtract(text)) {
      console.log("PDF con poco texto → OCR de páginas escaneadas");
      text = await extractTextFromScannedPDF(buffer);
    }
  } else if (isImage(contentType, fileURL)) {
    text = await extractTextFromImageBuffer(buffer);
  } else {
    text = await extractTextFromPDF(buffer);
    if (isWeakExtract(text)) {
      text = await extractTextFromScannedPDF(buffer);
    }
  }

  return prepareTextForAnalysis(text, 12000);
};

export const processFileFromURL = async ({
  fileId,
  uploadedBy,
  fileURL,
  title,
  originalName,
  subjectId,
}) => {
  if (!fileURL) {
    const err = new Error("fileURL es requerido.");
    err.statusCode = 400;
    throw err;
  }

  const response = await axios.get(fileURL, {
    responseType: "arraybuffer",
    timeout: 30000,
    validateStatus: () => true,
  });

  if (response.status !== 200) {
    const err = new Error(`Error al descargar archivo (${response.status})`);
    err.statusCode = 400;
    throw err;
  }

  const buffer = Buffer.from(response.data);
  const contentType = (response.headers["content-type"] || "").toLowerCase();

  let text = "";
  try {
    text = await extractDocumentText({ buffer, contentType, fileURL });
  } catch (err) {
    console.error("Error en OCR:", err.message);
    text = "";
  }

  if (isWeakExtract(text)) {
    text = "Contenido insuficiente para análisis.";
  }

  const rawAI = await analyzeText(text, { title, originalName });
  const aiResult = parseAIResult(rawAI);

  console.log("===== RESULTADO IA =====");
  console.log("Clasificación:", aiResult.classification);
  console.log("Confianza:", aiResult.confidence);
  console.log("Fuente:", aiResult.source);
  console.log("Razón:", aiResult.reason);
  console.log("Señales:", aiResult.signals);
  console.log("========================");

  let moderation = null;
  const highConfidence =
    aiResult.confidence >= AUTO_DECISION_MIN_CONFIDENCE &&
    aiResult.classification !== "incierto";

  if (aiResult.classification === "material_apoyo" && highConfidence) {
    await updateFileStatus(fileId, "approved");
    await notifyStudent({
      userId: uploadedBy,
      fileId,
      status: "approved",
    });
  } else if (aiResult.classification === "tarea_resuelta" && highConfidence) {
    await updateFileStatus(fileId, "rejected", aiResult.reason);
    await notifyStudent({
      userId: uploadedBy,
      fileId,
      status: "rejected",
      reason: aiResult.reason,
    });
  } else {
    // Baja confianza, incierto o conflicto → humano
    try {
      moderation = await sendToModeration({
        fileId,
        uploadedBy,
        fileURL,
        title,
        originalName,
        subjectId,
        aiResult,
      });
    } catch (err) {
      console.error("Error enviando a Moderation Service:", err.message);
    }
  }

  return {
    ai: aiResult,
    moderation,
    autoDecided: highConfidence,
  };
};

export const processLocalFile = async ({ filePath, uploadedBy }) => {
  const ext = path.extname(filePath).toLowerCase();
  let text = "";

  try {
    if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      text = await extractTextFromPDF(buffer);
      if (isWeakExtract(text)) {
        console.log("PDF escaneado detectado → OCR");
        text = await extractTextFromScannedPDF(buffer);
      }
    } else {
      text = await extractTextFromImage(filePath);
    }
  } catch (err) {
    console.error("Error en OCR local:", err.message);
  }

  text = prepareTextForAnalysis(text, 12000);
  if (isWeakExtract(text)) {
    text = "Contenido insuficiente para análisis.";
  }

  const rawAI = await analyzeText(text, {
    originalName: path.basename(filePath),
  });
  const aiResult = parseAIResult(rawAI);

  console.log("===== RESULTADO IA =====");
  console.log("Clasificación:", aiResult.classification);
  console.log("Confianza:", aiResult.confidence);
  console.log("Razón:", aiResult.reason);
  console.log("========================");

  return {
    ai: aiResult,
    moderation: null,
    uploadedBy,
  };
};
