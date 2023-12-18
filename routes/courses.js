const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const router = Router();

router.get("/", async (req, res) => {
    try {
        const courses = await Course.find().populate("userId", "email");
        res.render("courses", {
            title: "Courses",
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses,
        });
    } catch (err) {
        console.log(err);
    }
});

router.get("/:id/edit", auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect("/");
    }
    try {
        const course = await Course.findById(req.params.id);
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.redirect("/courses");
        }
        res.render("course-edit", {
            title: `Edit the ${course.title} course`,
            isCourses: true,
            course,
        });
    } catch (err) {
        console.log(err);
    }
});

router.post("/edit", auth, async (req, res) => {
    try {
        const { id } = req.body;
        delete req.body.id;
        const course = await Course.findById(id);
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.redirect("/courses");
        }
        Object.assign(course, req.body);
        await course.save();
        res.redirect("/courses");
    } catch (err) {
        console.log(err);
    }
});

router.post("/remove", auth, async (req, res) => {
    try {
        await Course.deleteOne({ _id: req.body.id, userId: req.user._id });
        res.redirect("/courses");
    } catch (e) {
        console.log(e);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        res.render("course", {
            layout: "empty",
            title: `${course.title}`,
            course,
        });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
