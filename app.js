const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user.model");

require("./config/db.config")
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.render("login")
});

app.get("/profile", isLoggedIn, function (req, res) {
    
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    let { username, password, email } = req.body;

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            await userModel.create({
                username,
                email,
                password: hash
            })

            let token = jwt.sign({ email }, "secret"); // don't do this, extremely unsafe, for representational purpose only.
            res.cookie("token", token);
            res.send("created");
        })
    })
});

app.get("/login", function (req, res) {
    res.render("login");
})

app.post("/login", async function (req, res) {
    let { username, password } = req.body;
    let user = await userModel.findOne({ username });
    if (!user) return res.send("incorrect username or password");

    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email }, "secret"); // don't repeat this, extremely unsafe
            res.cookie("token", token);
            res.send("loggedin");
        }
    });
})

app.get("/logout", function (req, res) {
    res.cookie("token", "");
    res.redirect("/login");
})

function isLoggedIn(req, res, next) {
    if (!req.cookies.token) return res.redirect("/login");
    jwt.verify(req.cookies.token, "secret", function (err, decoded) {
        if (err) {
            res.cookie("token", "");
            return res.redirect("/login");
        }
        else {
            req.user = decoded;
            next();
        }
    }) // don't write secret here, it's extremely unsafe
}

app.listen(3000,()=>{
    console.log("The Server is Running at port 3000")
});