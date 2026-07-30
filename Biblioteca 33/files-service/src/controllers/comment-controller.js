import Comment from "../models/comment.js";

export const addComment = async (req, res, next) => {
  try {

    const { fileId, text } = req.body;

    const comment = await Comment.create({
      fileId,
      user: req.user.id,
      text
    });

    res.json(comment);

  } catch (error) {

    next(error);

  }
};

export const getComments = async (req, res, next) => {
  try {

    const comments = await Comment.find({
      fileId: req.params.fileId
    });

    res.json(comments);

  } catch (error) {

    next(error);

  }
};