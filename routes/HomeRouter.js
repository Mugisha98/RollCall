const express = require("express");
const UserController = require("./../controllers/UserController.js");
const HomeController = require("./../controllers/HomeController.js");

const router = express.Router();

router.route("/")
    .get(HomeController.getLoginPage);

router.route("/home/frontpage")
    .get(UserController.protect2, HomeController.getHomePage)

router.route("/generateRandomCode")
  .post(UserController.protect2, HomeController.getNewCode);

router.route("/registerLecture")
    .get(UserController.protect2, HomeController.getRegisterPage)

router.route("/submitCode")
    .post(UserController.protect2, HomeController.checkSubmittedCode)

router.route("/statisticsPage")
    .get(UserController.protect2, HomeController.getStatisticsPage)

router.route("/createUser")
    .get(UserController.protect2,  HomeController.getCreateUserPage);


module.exports = router;
