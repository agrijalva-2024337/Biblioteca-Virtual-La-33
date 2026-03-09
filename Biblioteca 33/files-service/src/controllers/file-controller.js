const File = require("../models/file");
const axios = require("axios");

const uploadFile = async (req, res) => {
  try {

    const { title, description, subject } = req.body;

    const file = await File.create({
      title,
      description,
      subject,
      fileUrl: req.file.path,
      uploadedBy: req.body.uploadedBy || "test-user"
    });

    try {

      await axios.post(
        "http://localhost:3001/IA-OCR-Service/v1/pipeline/process-file",
        {
          fileId: file._id,
          uploadedBy: file.uploadedBy,
          fileURL: file.fileUrl
        }
      );

    } catch (error) {

      console.log("AI service error:", error.message);

    }

    res.json(file);

  } catch (error) {

    console.error(error);
    res.status(500).json(error);

  }
};

const getFiles = async (req, res) => {

  const files = await File.find().populate("subject");
  res.json(files);

};

const searchFiles = async (req, res) => {

  const { q } = req.query;

  const files = await File.find({
    title: { $regex: q, $options: "i" }
  }).populate("subject");

  res.json(files);

};

module.exports = {
  uploadFile,
  getFiles,
  searchFiles
};