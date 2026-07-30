import mongoose from "mongoose";

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

export default mongoose.model("Comment", CommentSchema);