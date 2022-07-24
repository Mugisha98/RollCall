const user = require("./../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const ObjectId = require("mongoose").Types.ObjectId;
require("dotenv").config({ path: "./.env" });
const res = require("express/lib/response");
const User = require("./../models/User.js");
const course = require("./../models/Course.js");
const CourseController = require("./../controllers/CourseController.js");

const passwordRegExpr = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$/;
let counter = 0;

const signToken = (id, role, fullName) => {
  const isValidated = validateAttributesForToken(id, role, fullName);
  if (!isValidated) {
    return null;
  }
  return jwt.sign({ id, role, fullName }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

function validateAttributesForToken(id, role, fullName) {
  const regName = /^[a-zA-Z]+ [a-zA-Z]+$/;
  if (!(id instanceof ObjectId)) {
    return false;
  }
  if (role !== "teacher" && role !== "student" && role !== "admin") {
    return false;
  }
  if (!regName.test(fullName)) {
    return false;
  }
  return true;
}

async function login(req, res) {
  const {email, password} = req.body.credentials;

  console.log(++counter, email, password);

  const userToLogin = await user.findOne({ email }).select("+passwordHash");

  if (!userToLogin) {
    return res.status(401).json({
      status: "error",
      message: "Incorrect email and password combination",
    });
  }

  const correct = await bcrypt.compare(password, userToLogin.passwordHash);

  if (!correct) {
    return res.status(401).json({
      status: "error",
      message: "Incorrect email and password combination",
    });
  }

  const fullName = userToLogin.firstName + " " + userToLogin.lastName;

  const token = signToken(userToLogin._id, userToLogin.role, fullName);
  if (token === null) {
    return res.status(400).json({ msg: "Sorry the token could not be created" });
  }
  res.cookie("token", token);

  res.status(200).json({
    status: "success",
    data: userToLogin,
    token,
  });
}

async function logout(req, res) {
  res.clearCookie('token')
  res.redirect("/")
}

async function protect2(req, res, next) {
  if (!req.cookies.token) {
    return res.status(401).json({ message: "You are not logged in" });
  }
  const decodedID = await getIDFromToken(req);
  const user = await findUserInDB({ _id: decodedID });

  if (!user) {
    return res.json({ message: "The user no longer exists" });
  }
  next();
}

async function findUserInDB(query) {
  return await user.findOne(query).select("+passwordHash");
}

async function getIDFromToken(req) {
  const token = req.cookies.token;
  const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  return decodedJWT.id;
}

async function createUser(req, res) {
  // Check if someone with that email already exists
  const userInDB = await User.findOne({email: req.body.user.email});

  if (userInDB) {
    return res.status(409).json({ message: "Someone with that email already exists. Please choose another"});
  }

  const user = req.body.user;
  // Check if parameters are acceptable
  if (user.firstName.length < 2 || user.firstName.length > 50) {
    return res.status(400).json({ message: "Length of first name should be between 2-50 (inclusive)" });
  } else if (user.lastName.length < 2 || user.lastName.length > 50) {
    return res.status(400).json({ message: "Length of last name should be between 2-50 (inclusive)" });
  }

  // Check if password is acceptable
  if (!passwordRegExpr.test(user.password)) {
    return res.status(400).json({ message: "Passwords must follow following rules: 8-30 characters and must contain at least 1 uppercase, 1 lowercase and 1 number" });
  }

  // hash password
  const passwordHash = await bcrypt.hash(user.password, 10); 

  const newUser = new User({
    firstName: req.body.user.firstName,
    lastName: req.body.user.lastName,
    passwordHash: passwordHash,
    email: req.body.user.email,
    role: req.body.user.role,
    courses: req.body.user.courses
  });

  // If role is teacher save teacher in selected courses
  if (newUser.role === 'teacher') {
    // check email length (teacher email format is: aaaa@kea.dk, (11 characters))
    if (newUser.email.length !== 11) {
      return res.status(400).json({ message: "Teacher emails are only allowed to be 11 characters" });
    }
    CourseController.assignTeacher(newUser);
  } 
  // Else increment studentmount since student just enrolled in course
  else if (newUser.role === 'student') {
    // check email length (student email format is: aaaa1111@stud.kea.dk, (20 characters))
    if (newUser.email.length !== 20) {
      return res.status(400).json({ message: "Student emails are only allowed to be 20 characters" });
    }
    CourseController.incrementStudentAmount(newUser);
  }

  // save user
  await newUser.save();

  // return response
  return res.status(201).json({ message: "User created" });
}

module.exports = {
  login,
  protect2,
  signToken,
  createUser,
  logout
};