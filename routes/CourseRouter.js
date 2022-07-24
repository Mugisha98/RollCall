const UserController = require("./../controllers/UserController.js");
const CourseController = require("./../controllers/CourseController.js");
const express = require("express");
const router = express.Router();

router.route("/")
  .get(UserController.protect2, CourseController.get);

router.route("/id/:id")
  .get(UserController.protect2, CourseController.getById);

router.route("/teacher/:name")
  .get(UserController.protect2, CourseController.getByTeacherName);

router.route("/noTeacher")
  .get(UserController.protect2, CourseController.getWhereNoTeacher);

router.route("/token")
  .get(UserController.protect2, CourseController.getByToken);

router.route("/:id")
  .delete(UserController.protect2, CourseController.remove);

module.exports = router;