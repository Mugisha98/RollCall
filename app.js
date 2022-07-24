const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/UserRouter.js");
const homeRouter = require("./routes/HomeRouter.js");
const courseRouter = require("./routes/CourseRouter.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

require("dotenv").config({ path: "./.env" });

function app() {
    const app = express();
    mongoose.connect(process.env.DB, {useNewUrlParser: true, 
        useUnifiedTopology: true,})
        .then(() => {
        console.log("Connected to database");
    });

    //app.use(express.json());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    app.use("/user", userRouter);
    app.use("/", homeRouter)
    app.use("/courses", courseRouter);

    app.use(express.static(__dirname + "/public"));

    return app;
}

module.exports = app;
