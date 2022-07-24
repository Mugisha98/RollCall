const Course = require("../models/Course");
const User = require("../models/User");
const HomeController = require("./../controllers/HomeController.js");

// Gets all courses
async function get(req, res) {
    try {
        Course.find({}, function (err, courses) {
            res.send(courses);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

// Get course by id
async function getById(req, res) {
    try {
        const course = await Course.findOne({
            _id: req.params.id
        });

        if (!course) {
            return res.status(404).send();
        }

        res.send(course);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
}


// Get course by teacher name
async function getByTeacherName(req, res) {
    try {
        const course = await Course.find({teacherName: req.params.name});

        if (!course) {
            return res.status(404).send();
        }

        res.send(course);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }

}

// Get where courses where teacher name is empty
async function getWhereNoTeacher(req, res) {
    try {
        const course = await Course.find({teacherName: ""});

        if (!course) {
            return res.status(404).send();
        }

        res.send(course);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
}

// Get courses based on token
async function getByToken(req, res) {
    try {
        const fullName = await HomeController.getNameFromToken(req);
        const firstName = fullName.split(" ")[0];
        const lastName = fullName.split(" ")[1];

        const teacherDocument = await User.findOne({firstName, lastName});
        const teacherCourses = teacherDocument.courses;

        const courses = await Course.find({
            courseName: {$in: teacherCourses}
        });

        if (!courses) {
            return res.status(404).send();
        }

        res.send(courses);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
}

// Deletes a course based on id
async function remove(req, res) {
    try {
        const course = await Course.findOneAndDelete({_id: req.params.id});

        if (!course) {
            return res.status(404).send();
        }

        res.send(course);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
}

// Sets courses teacherName to teachers name
function assignTeacher(teacher) {
    teacher.courses.forEach(courseName => {
        Course.findOne({courseName: courseName})
          .then(dbCourse => {
            dbCourse.teacherName = teacher.firstName + " " + teacher.lastName;
            dbCourse.markModified('teacherName');
  
            dbCourse.save();
          });
      });
}

// Increments studentamount in students courses when created
function incrementStudentAmount(student) {
    student.courses.forEach(courseName => {
        Course.findOne({courseName: courseName})
          .then(dbCourse => {
            dbCourse.studentAmount += 1;;
            dbCourse.markModified('studentAmount');
  
            dbCourse.save();
          });
      });
}

module.exports = {
    get,
    getById,
    getByTeacherName,
    getWhereNoTeacher,
    getByToken,
    remove,
    assignTeacher,
    incrementStudentAmount
};