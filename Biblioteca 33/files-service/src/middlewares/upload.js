const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.js");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "biblioteca-files",
    resource_type: "raw"
  }
});

module.exports = multer({ storage });