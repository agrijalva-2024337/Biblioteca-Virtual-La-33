const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");

const {
  uploadFile,
  getFiles,
  searchFiles
} = require("../controllers/file-controller");

router.post("/upload", upload.single("file"), uploadFile);

router.get("/", getFiles);

router.get("/search", searchFiles);

module.exports = router;