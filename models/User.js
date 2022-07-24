const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
  id: ObjectId,
  firstName: {
    type: String,
    required: [true, "Please provide a first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide a surname"],
  },
  email: {
      type: String,
      required: [true, "Please provide a username"]
  },
  passwordHash: {
    type: String,
    required: [true, "Please provide hashed password"],
    select: false,
  },
  role: {
    type: String,
    required: [true, "Please provide a role"]
  },
  courses: [{  // names of courses
    type: String
  }]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
