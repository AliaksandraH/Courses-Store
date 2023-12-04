const dotenv = require("dotenv");
const express = require("express");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {
    allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const mongoose = require("mongoose");
const User = require("./models/user");
const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const cartRoutes = require("./routes/cart");
dotenv.config();

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(async (req, res, next) => {
    try {
        const user = await User.findById("656dcc890217d3dc5b98063e");
        req.user = user;
        next();
    } catch (e) {
        console.log(e);
    }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);

const PORT = process.env.PORT || 3000;
async function start() {
    try {
        const url = process.env.MONGODB_URL;
        await mongoose.connect(url);
        const candidata = await User.findOne();
        if (!candidata) {
            const user = new User({
                email: "aliaksandra@gmail.com",
                name: "Aliaksandra",
                cart: { items: [] },
            });
            await user.save();
        }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();
