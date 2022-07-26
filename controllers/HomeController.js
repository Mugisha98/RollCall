const path = require("path");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Course = require("../models/Course");
const User = require("../models/User");

const THRESHOLD = 10; //  in minutes

async function getLoginPage(req, res) {
  res.sendFile("./Login/LoginPage.html", {
    root: path.join(__dirname, "../public"),
  });
}

async function getHomePage(req, res) {
  const role = await getAttributeFromToken(req, "role");
  if (role === "student") {
    res.sendFile("./Frontpage/StudentPage.html", {
      root: path.join(__dirname, "../public"),
    });
  } else if (role === "teacher") {
    res.sendFile("./Frontpage/TeacherPage.html", {
      root: path.join(__dirname, "../public"),
    });
  } else if (role === "admin") {
    res.sendFile("./Frontpage/AdminPage.html" , {
      root: path.join(__dirname, "../public")
    });
  }
}

async function getStatisticsPage(req, res) {
  const role = await getAttributeFromToken(req, "role");
  if (role === "student") {
    return res.json({ msg: "only for teachers" });
  } else if (role === "teacher") {
    res.sendFile("/Statistics/StatisticsPage.html", {
      root: path.join(__dirname, "../public"),
    });
  }
}

async function getRegisterPage(req, res) {
  const role = await getAttributeFromToken(req, "role");
  if (role === "student") {
    return res.json({ msg: "only for teachers" });
  } else if (role === "teacher") {
    res.sendFile("./RegisterLecture/RegisterLecturePage.html", {
      root: path.join(__dirname, "../public"),
    });
  }
}

async function getCreateUserPage(req, res) {
  const role = await getAttributeFromToken(req, "role");
  if (role !== "admin") {
    return res.json({ msg: "only for administrators" });
  }

  res.sendFile("./CreateUser/CreateUserPage.html", {
    root: path.join(__dirname, "../public"),
  });
}

async function getAttributeFromToken(req, attribute) {
  const token = req.cookies.token;
  const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  return decodedJWT[attribute];
}

async function getNameFromToken(req) {
  const token = req.cookies.token;
  const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  return decodedJWT.fullName;
}

async function getNewCode(req, res) {
  const autoGeneratedCode = await generateRandomCode();
  const courseName = req.body.courseName;
  //const newLecture = await createNewLecture(autoGeneratedCode);
  const saveLectureInDB = await Course.updateOne(
    { courseName },
    { $push: { lectures: { autoGeneratedCode, date: new Date() } } }
  );
  console.log(saveLectureInDB);
  res.status(200).json({ autoGeneratedCode, timeToLive: THRESHOLD });
}

async function generateRandomCode() {
  return Math.floor(10000 + Math.random() * 90000);
}

async function checkSubmittedCode(req, res) {
  const submittedCode = req.body.submittedCode;
  if (isNaN(submittedCode)) {
    return res.json({ msg: "Sorry. Please enter a number" });
  }
  const fullName = await getAttributeFromToken(req, "fullName");

  const student = await User.findOne({
    firstName: fullName.split(" ")[0],
    lastName: fullName.split(" ")[1],
  });
  const studentsCourses = student["courses"];

  const foundCourse = await Course.findOne({
    courseName: { $in: studentsCourses },
    lectures: { $elemMatch: { autoGeneratedCode: submittedCode } },
  });

  if (!foundCourse) {
    return res.json({
      msg: "Sorry. We did not find any open lecures with that code.",
    });
  }

  const lecture = foundCourse.lectures[foundCourse.lectures.length - 1];
  const classCreatedAtTimestamp = lecture.date;

  const timeStampWithLimit =
    classCreatedAtTimestamp.getTime() + 1000 * 60 * THRESHOLD;

  if (timeStampWithLimit < Date.now()) {
    return res.json({ msg: `Too late. ${THRESHOLD} minutes has passed.` });
  }

  if (!lecture.attendance.includes(fullName)) {
    lecture.attendance.push(fullName);
  } else {
    return res.json({ msg: "Already registered" });
  }

  await foundCourse.save();

  res.json({ msg: alert("You're now registred at" + courseName) });
}

module.exports = {
  getLoginPage,
  getHomePage,
  getNewCode,
  getRegisterPage,
  checkSubmittedCode,
  getStatisticsPage,
  getNameFromToken,
  getAttributeFromToken,
  getCreateUserPage
};
