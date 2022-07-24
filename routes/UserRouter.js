const express = require("express");
const UserController = require("./../controllers/UserController.js");

const router = express.Router();

router.route("/login").post(UserController.login);

router.route("/logout").get(UserController.logout)

router.route("/").post(UserController.protect2, UserController.createUser);

module.exports = router;
