const express = require("express");

const router = express.Router();

const {
  createSubject,
  getSubjects
} = require("../controllers/subject-controller");

router.post("/", createSubject);

router.get("/", getSubjects);

module.exports = router;