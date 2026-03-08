const express = require("express");

const router = express.Router();

const {
  addComment,
  getComments
} = require("../controllers/comment-controller");

router.post("/", addComment);

router.get("/:fileId", getComments);

module.exports = router;