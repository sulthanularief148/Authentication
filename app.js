require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDb", {
    useNewUrlParser: true
});
const userSchema = new mongoose.Schema({
    email: String,
    pass: String
});


userSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ["pass"]
});



const User = new mongoose.model("User", userSchema);



app.get("/", (req, res) => {
    res.render("home")

})



app.route("/register")
    .get((req, res) => {
        res.render("register")
    })
    .post((req, res) => {
        const newuser = new User({
            email: req.body.username,
            pass: req.body.password
        });

        newuser.save(err => err ? console.log(err) : res.render("secrets"));
    })



app.route("/login")
    .get((req, res) => {
        res.render("login")
    })
    .post((req, res) => {
        const userEmail = req.body.username;
        const userPassword = req.body.password;


        User.findOne({
            email: userEmail
        }, (err, founduser) => {
            if (err) {
                console.log(err);
                res.redirect("login");
            } else {
                if (founduser) {
                    if (founduser.pass === userPassword) {
                        res.render("secrets")
                    }
                }
            }
        });

    });



app.get("/secrets", (req, res) => {
    res.render("secrets")
});


app.get("/submit", (req, res) => {
    res.render("submit")
});

















app.listen(process.env.PORT, (req, res) => {
    console.log(`Your server running on port ` + process.env.PORT)
})