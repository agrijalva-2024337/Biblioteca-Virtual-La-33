const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({

  title: String,

  description: String,

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject"
  },

  fileUrl: String,

  uploadedBy: String,

  status: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("File", FileSchema);