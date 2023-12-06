const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
const Handlebars = require("handlebars");
const {
    allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const mongoose = require("mongoose");
const varMiddleware = require("./middleware/variables");
const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
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
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: "some secret value",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
app.use(varMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);

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
