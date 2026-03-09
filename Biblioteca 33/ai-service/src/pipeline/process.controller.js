import { processFileFromURL, processLocalFile } from "./process.service.js";

export const processFromURL = async (req, res, next) => {
  try {

    const result = await processFileFromURL(req.body);

    res.status(200).json({
      success: true,
      message: "Archivo procesado desde URL",
      result
    });

  } catch (error) {
    next(error);
  }

  console.log("BODY RECIBIDO:", req.body);
};


export const processTestUpload = async (req, res, next) => {
  try {

    const filePath = req.file.path;

    const result = await processLocalFile({
      filePath,
      uploadedBy: "test-user"
    });

    res.status(200).json({
      success: true,
      message: "Archivo de prueba procesado",
      result
    });

  } catch (error) {
    next(error);
  }
};

