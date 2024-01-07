const { body } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.registerValidators = [
    body("email")
        .isEmail()
        .withMessage("Enter the correct email address.")
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject(
                        "A user with such an email already exists."
                    );
                }
            } catch (err) {
                console.log(err);
            }
        })
        .normalizeEmail(),
    body(
        "password",
        "The password must contain more than 5 characters and less than 50."
    )
        .isLength({ min: 6, max: 50 })
        .trim(),
    body("confirm")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords must match.");
            }
            return true;
        })
        .trim(),
    body(
        "name",
        "The name must contain more than 1 characters and less than 20."
    )
        .isLength({ min: 2, max: 20 })
        .trim(),
];

exports.loginValidators = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Enter the correct email address.")
        .normalizeEmail()
        .custom(async (value, { req }) => {
            const candidate = await User.findOne({ email: value });
            if (!candidate) {
                return Promise.reject("There is no such user.");
            }
        }),
    body("password")
        .isLength({ min: 6, max: 50 })
        .withMessage(
            "The password must contain more than 5 characters and less than 50."
        )
        .trim()
        .custom(async (value, { req }) => {
            const candidate = await User.findOne({ email: req.body.email });
            if (candidate) {
                const areSame = await bcrypt.compare(value, candidate.password);
                if (!areSame) {
                    return Promise.reject("Invalid password.");
                }
            }
        }),
];

exports.courseValidators = [
    body("title")
        .isLength({ min: 2 })
        .withMessage("The title must contain more than 1 characters.")
        .trim(),
    body("price").isNumeric().withMessage("Enter the correct price."),
    body("img", "Enter the correct URL of the image.").isURL().trim(),
];
