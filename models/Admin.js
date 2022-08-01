const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const adminSchema = new Schema({
    id: ObjectId,
    email:{
        type:String
    },
    password:{
        type:String
    }
});

const Admin = mongoose.model("Admins", adminSchema);

module.exports = Admin;
