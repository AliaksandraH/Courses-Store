const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const csrf = require("csurf");
const flash = require("connect-flash");
const exphbs = require("express-handlebars");
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
const Handlebars = require("handlebars");
const {
    allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const varMiddleware = require("./middleware/variables");
const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const userMiddleware = require("./middleware/user");
const error404 = require("./middleware/error");
const fileMiddleware = require("./middleware/file");
const keys = require("./keys");

const app = express();
dotenv.config();

var store = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    collection: "sessions",
});

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require("./utils/hbs-helpers"),
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: keys.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
app.use(fileMiddleware.single("avatar"));
app.use(csrf());
app.use(flash());
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.use(error404);

const PORT = process.env.PORT || 3000;
async function start() {
    try {
        const url = process.env.MONGODB_URL;
        await mongoose.connect(url);
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();
