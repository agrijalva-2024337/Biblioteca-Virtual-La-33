const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({

  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File"
  },

  user: String,

  text: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Comment", CommentSchema);