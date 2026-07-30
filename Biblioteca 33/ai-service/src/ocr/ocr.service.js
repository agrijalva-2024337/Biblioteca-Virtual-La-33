import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import { fromBuffer } from "pdf2pic";
import fs from "fs";

const OCR_LANG = process.env.OCR_LANG || "spa+eng";
const OCR_MIN_CHARS = Number(process.env.OCR_MIN_CHARS || 40);
const OCR_MAX_PAGES = Number(process.env.OCR_MAX_PAGES || 8);

const createOcrWorker = async () => {
  const worker = await createWorker(OCR_LANG, 1, {
    logger: () => {},
  });
  await worker.setParameters({
    tessedit_pageseg_mode: "1",
    preserve_interword_spaces: "1",
  });
  return worker;
};

export const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return (data.text || "").trim();
  } catch (error) {
    console.error("Error leyendo PDF:", error.message);
    return "";
  }
};

export const extractTextFromImage = async (imagePath) => {
  const worker = await createOcrWorker();
  try {
    const result = await worker.recognize(imagePath);
    return (result.data.text || "").trim();
  } catch (error) {
    console.error("Error OCR imagen:", error.message);
    return "";
  } finally {
    await worker.terminate();
  }
};

export const extractTextFromImageBuffer = async (buffer) => {
  const worker = await createOcrWorker();
  try {
    const result = await worker.recognize(buffer);
    return (result.data.text || "").trim();
  } catch (error) {
    console.error("Error OCR buffer:", error.message);
    return "";
  } finally {
    await worker.terminate();
  }
};

export const extractTextFromScannedPDF = async (pdfBuffer) => {
  const worker = await createOcrWorker();
  try {
    let fullText = "";

    const convert = fromBuffer(pdfBuffer, {
      density: 220,
      format: "png",
      width: 1800,
      height: 2400,
      preserveAspectRatio: true,
    });

    for (let i = 1; i <= OCR_MAX_PAGES; i++) {
      try {
        const page = await convert(i);
        if (!page?.path) break;

        const result = await worker.recognize(page.path);
        fullText += `\n${result.data.text || ""}`;

        try {
          fs.unlinkSync(page.path);
        } catch {
          /* ignore */
        }

        // Si ya hay mucho texto, no hace falta OCR de todas las páginas
        if (fullText.trim().length > 12000) break;
      } catch {
        break;
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error OCR PDF escaneado:", error.message);
    return "";
  } finally {
    await worker.terminate();
  }
};

export const isWeakExtract = (text) =>
  !text || text.trim().length < OCR_MIN_CHARS;
