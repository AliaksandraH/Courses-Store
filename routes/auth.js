const { Router } = require("express");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const regEmail = require("../emails/registration");
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

module.exports = router;
