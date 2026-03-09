import axios from "axios";
import fs from "fs";
import path from "path";
import {
  extractTextFromPDF,
  extractTextFromImage,
  extractTextFromImageBuffer,
  extractTextFromScannedPDF
} from "../ocr/ocr.service.js";
import { analyzeText } from "../ai/ai.service.js";

const MODERATION_URL =
  process.env.MODERATION_URL ||
  "http://localhost:3000/Biblioteca/v1/moderations";


// Determina si el archivo es una imagen
const isImage = (contentType, fileURL) => {
  if (contentType.includes("image")) return true;
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileURL || "");
};


// Determina si el archivo es PDF
const isPDF = (contentType, buffer) => {
  if (contentType.includes("pdf")) return true;

  return buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50;
};


// Parser seguro de la respuesta de IA
const parseAIResult = (content) => {
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      classification: parsed?.classification || "incierto",
      reason: parsed?.reason || "La IA no proporcionó explicación."
    };
  } catch {
    return {
      classification: "incierto",
      reason: "No se pudo interpretar la respuesta de la IA."
    };
  }
};

// Determina si se debe enviar a moderación
const needsModeration = (classification) => {
  return classification === "incierto";
};

export const processFileFromURL = async ({ fileId, uploadedBy, fileURL }) => {
  if (!fileURL) {
    const err = new Error("fileURL es requerido.");
    err.statusCode = 400;
    throw err;
  }

  const response = await axios.get(fileURL, {
    responseType: "arraybuffer",
    timeout: 20000,
    validateStatus: () => true
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

    if (isPDF(contentType, buffer)) {

      // intentar extraer texto normal
      text = await extractTextFromPDF(buffer);

      // si no hay texto suficiente - OCR de imágenes
      if (!text || text.trim().length < 20) {
        console.log("PDF escaneado detectado → aplicando OCR de imágenes");
        text = await extractTextFromScannedPDF(buffer);
      }

    } else if (isImage(contentType, fileURL)) {

      text = await extractTextFromImageBuffer(buffer);

    } else {

      text = await extractTextFromPDF(buffer);

    }

  } catch (err) {
    console.error("Error en OCR:", err.message);
    text = "";
  }

  // Validar texto OCR
  if (!text || text.trim().length < 20) {
    text = "Contenido insuficiente para análisis.";
  }

  const aiInput = text.slice(0, 4000);

  const rawAI = await analyzeText(aiInput);
  const aiResult = parseAIResult(rawAI);
  console.log("===== RESULTADO IA =====");
  console.log("Clasificación:", aiResult.classification);
  console.log("Razón:", aiResult.reason);
  console.log("========================");

  let moderation = null;

  if (needsModeration(aiResult.classification)) {
    try {

      const payload = {
        fileId,
        uploadedBy: uploadedBy || "anonymous",
        fileURL,
        aiClassification: aiResult.classification,
        aiReason: aiResult.reason
      };

      const modRes = await axios.post(MODERATION_URL, payload, {
        timeout: 15000,
        validateStatus: () => true
      });

      if (modRes.status >= 200 && modRes.status < 300) {
        moderation = modRes.data;
      }

    } catch (err) {
      console.error("Error enviando a Moderation Service:", err.message);
    }
  }

  return {
    ai: aiResult,
    moderation
  };
};

// Procesamiento de archivo local- pruebas
export const processLocalFile = async ({ filePath, uploadedBy }) => {

  const ext = path.extname(filePath).toLowerCase();

  let text = "";

  try {

    if (ext === ".pdf") {

      const buffer = fs.readFileSync(filePath);

      text = await extractTextFromPDF(buffer);

      if (!text || text.trim().length < 20) {
        console.log("PDF escaneado detectado → OCR");
        text = await extractTextFromScannedPDF(buffer);
      }

    } else {

      text = await extractTextFromImage(filePath);

    }

  } catch (err) {
    console.error("Error en OCR local:", err.message);
  }

  if (!text || text.trim().length < 20) {
    text = "Contenido insuficiente para análisis.";
  }

  const aiInput = text.slice(0, 4000);

  const rawAI = await analyzeText(aiInput);
  const aiResult = parseAIResult(rawAI);
  console.log("===== RESULTADO IA =====");
  console.log("Clasificación:", aiResult.classification);
  console.log("Razón:", aiResult.reason);
  console.log("========================");

  return {
    ai: aiResult,
    moderation: null
  };
};