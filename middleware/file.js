const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "images");
    },
    filename(req, file, cb) {
        cb(
            null,
            crypto.randomBytes(20).toString("hex") +
                path.extname(file.originalname)
        );
    },
});

const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
});
