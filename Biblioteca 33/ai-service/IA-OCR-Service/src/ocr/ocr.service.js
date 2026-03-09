import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import { fromBuffer } from "pdf2pic";
import fs from "fs";


// Extraer texto de PDF con texto real

export const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("Error leyendo PDF:", error.message);
    return "";
  }
};

 // OCR desde imagen (archivo)
 
export const extractTextFromImage = async (imagePath) => {

  const worker = await createWorker("spa");

  try {

    const result = await worker.recognize(imagePath);
    return result.data.text || "";

  } catch (error) {

    console.error("Error OCR imagen:", error.message);
    return "";

  } finally {

    await worker.terminate();

  }

};


// OCR desde buffer de imagen

export const extractTextFromImageBuffer = async (buffer) => {

  const worker = await createWorker("spa");

  try {

    const result = await worker.recognize(buffer);
    return result.data.text || "";

  } catch (error) {

    console.error("Error OCR buffer:", error.message);
    return "";

  } finally {

    await worker.terminate();

  }

};


// OCR para PDFs escaneados (imagenes dentro del PDF)

export const extractTextFromScannedPDF = async (pdfBuffer) => {

  try {

    let fullText = "";

    const convert = fromBuffer(pdfBuffer, {
      density: 300,
      format: "png",
      width: 2000,
      height: 2000
    });

    // máximo 5 páginas para evitar OCR muy lento
    for (let i = 1; i <= 5; i++) {

      try {

        const page = await convert(i);

        if (!page?.path) break;

        const worker = await createWorker("spa");

        const result = await worker.recognize(page.path);

        await worker.terminate();

        fullText += "\n" + result.data.text;

        // borrar imagen temporal
        fs.unlinkSync(page.path);

      } catch (err) {

        break;

      }

    }

    return fullText;

  } catch (error) {

    console.error("Error OCR PDF escaneado:", error.message);
    return "";

  }

};