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
      uploadedBy: req.headers["user-id"]
    });

    // enviar archivo al AI service
    try {
      await axios.post("http://ai-service:3003/analyze", {
        fileId: file._id,
        path: file.fileUrl
      });
    } catch (error) {
      console.log("AI service not available");
    }

    res.json(file);

  } catch (error) {
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