const Comment = require("../models/comment");

const addComment = async (req, res) => {

  const { fileId, text } = req.body;

  const comment = await Comment.create({
    fileId,
    user: req.headers["user-id"],
    text
  });

  res.json(comment);
};

const getComments = async (req, res) => {

  const comments = await Comment.find({
    fileId: req.params.fileId
  });

  res.json(comments);
};

module.exports = {
  addComment,
  getComments
};