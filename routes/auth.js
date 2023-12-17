const { Router } = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const regEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const User = require("../models/user");
const router = Router();
dotenv.config();

const transporter = nodemailer.createTransport(
    sendgrid({
        auth: { api_key: process.env.SENDGRID_API_KEY },
    })
);

router.get("/login", (req, res) => {
    res.render("auth/login", {
        title: "Authorization",
        isLogin: true,
        errorRegister: req.flash("errorRegister"),
        errorLogin: req.flash("errorLogin"),
    });
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/auth/login#login");
    });
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const candidate = await User.findOne({ email });
        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password);
            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save((err) => {
                    if (err) throw err;
                    res.redirect("/");
                });
            } else {
                req.flash("errorLogin", "Invalid password.");
                res.redirect("/auth/login#login");
            }
        } else {
            req.flash("errorLogin", "There is no such user.");
            res.redirect("/auth/login#login");
        }
    } catch (e) {
        console.log(e);
    }
});

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirm } = req.body;
        const candidate = await User.findOne({ email });
        if (candidate) {
            req.flash(
                "errorRegister",
                "A user with such an email already exists."
            );
            res.redirect("/auth/login#register");
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({
                name,
                email,
                password: hashPassword,
                cart: { items: [] },
            });
            await user.save();
            res.redirect("/auth/login#login");
            await transporter.sendMail(regEmail(email));
        }
    } catch (e) {
        console.log(e);
    }
});

router.get("/reset", (req, res) => {
    res.render("auth/reset", {
        title: "Password Reset",
        error: req.flash("error"),
    });
});

router.post("/reset", (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash("error", "Something went wrong, try again later.");
                return res.redirect("/auth/reset");
            }
            const token = buffer.toString("hex");
            const candidate = await User.findOne({ email: req.body.email });
            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                await transporter.sendMail(
                    resetEmail(candidate.email, candidate.name, token)
                );
                res.redirect("/auth/login");
            } else {
                req.flash(
                    "error",
                    "There is no user with such an email address."
                );
                return res.redirect("/auth/reset");
            }
        });
    } catch (err) {
        console.log(err);
    }
});

router.get("/password/:token", async (req, res) => {
    if (!req.params.token) {
        return res.redirect("/auth/login");
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() },
        });
        if (!user) return res.redirect("/auth/login");
        res.render("auth/password", {
            title: "Password Reset",
            error: req.flash("error"),
            userId: user._id.toString(),
            token: req.params.token,
        });
    } catch (err) {
        console.log(err);
    }
});

router.post("/password", async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() },
        });
        if (!user) {
            req.flash("errorLogin", "The token's lifetime has expired.");
            return res.redirect("/auth/login");
        }
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetToken = undefined;
        user.resetTokenExp = undefined;
        await user.save();
        return res.redirect("/auth/login");
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
