const Subject = require("../models/subject");

const createSubject = async (req, res) => {

  const subject = await Subject.create(req.body);

  res.json(subject);
};

const getSubjects = async (req, res) => {

  const subjects = await Subject.find();

  res.json(subjects);
};

module.exports = {
  createSubject,
  getSubjects
};