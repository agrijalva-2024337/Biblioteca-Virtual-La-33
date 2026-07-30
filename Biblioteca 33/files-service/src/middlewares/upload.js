import fs from "fs";
import path from "path";
import multer from "multer";
import multerStorageCloudinary from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary.js";

const { CloudinaryStorage } = multerStorageCloudinary;

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_NAME?.trim() &&
      process.env.CLOUDINARY_KEY?.trim() &&
      process.env.CLOUDINARY_SECRET?.trim()
  );

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "biblioteca-files",
    resource_type: "raw",
  },
});

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = String(file.originalname || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const cloudinaryUpload = multer({ storage: cloudinaryStorage });
const localUpload = multer({ storage: diskStorage });

const publicBaseUrl = () => {
  const fromEnv = process.env.FILES_PUBLIC_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT || 3003}`;
};

/**
 * Multer + Cloudinary (prod) o disco local (dev sin CLOUDINARY_*).
 * Evita el 500 opaco cuando Cloudinary no está configurado.
 */
export const uploadSingle = (fieldName = "file") => (req, res, next) => {
  const useCloudinary = isCloudinaryConfigured();
  const uploader = useCloudinary
    ? cloudinaryUpload.single(fieldName)
    : localUpload.single(fieldName);

  if (!useCloudinary) {
    console.warn(
      "[files-service] CLOUDINARY_* vacío — usando almacenamiento local en /uploads (solo desarrollo)"
    );
  }

  return uploader(req, res, (err) => {
    if (err) {
      const message =
        err.message ||
        err.error?.message ||
        (typeof err.error === "string" ? err.error : null) ||
        "Error al subir el archivo";

      const isMultipartParse =
        /boundary/i.test(message) || /multipart/i.test(message);

      console.error("[upload] multer error:", {
        message,
        isMultipartParse,
        useCloudinary,
      });

      const normalized = Object.assign(new Error(
        isMultipartParse
          ? "Formato multipart inválido (falta boundary). El cliente no debe fijar Content-Type a mano."
          : message
      ), {
        statusCode: isMultipartParse ? 400 : (err.http_code || err.statusCode || 500),
        code: isMultipartParse
          ? "MULTIPART_BOUNDARY_MISSING"
          : useCloudinary
            ? "CLOUDINARY_UPLOAD_ERROR"
            : "LOCAL_UPLOAD_ERROR",
        cause: err,
      });
      return next(normalized);
    }

    console.log("[upload] file received:", {
      storage: useCloudinary ? "cloudinary" : "local",
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      path: req.file?.path,
      bodyKeys: Object.keys(req.body || {}),
      title: req.body?.title,
      subject: req.body?.subject,
      promotionYear: req.body?.promotionYear,
    });

    if (!useCloudinary && req.file) {
      // Misma forma que Cloudinary: path = URL pública del archivo
      req.file.path = `${publicBaseUrl()}/uploads/${req.file.filename}`;
    }

    return next();
  });
};

export default cloudinaryUpload;
