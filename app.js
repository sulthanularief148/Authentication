require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const localPassport = require("passport-local");
const passport = require("passport");
// var User = require('./models/user');
const passportLocalMongoose = require('passport-local-mongoose');
// const findOrCreate = require("mongoose-findorcreate");
const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

//Session
app.use(session({
    secret: 'Thisismyauthenticationlearning',
    resave: false,
    saveUninitialized: true
}));
//passport
app.use(passport.initialize());
app.use(passport.session());



mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/userDb", {
    useNewUrlParser: true
});


const userSchema = new mongoose.Schema({
    email: String,
    pass: String
});
//passport-local-mongoose
userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate)


// Below commented is normal Encryption it easily decrypt the password. So i used Hashing
// userSchema.plugin(encrypt, {
//     secret: process.env.SECRET,
//     encryptedFields: ["pass"]
// });


const User = new mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function (user, done) {
    done(null, user._id);
    // if you use Model.id as your idAttribute maybe you'd want
    // done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});



// 561d946174cce723c345c5b9c2ad429c- hashing value Arief@123
// console.log(md5(12345));
app.get("/", (req, res) => {
    res.render("home");

    User.find({}, (err, founduser) => {
        console.log(founduser);
    })

})
app.route("/secrets")
    .get((req, res) => {
        if (req.isAuthenticated) {
            res.redirect("/secrets");
        } else {
            res.redirect("/login")
        }
        // res.render("secrets")
    });




app.get("/login", (req, res) => {
    res.render("login")
});
app.post("/login", function (req, res) {
    const newuser = new User({
        email: req.body.username,
        pass: req.body.password
    });
    req.login(newuser, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })
})



app.get("/register", (req, res) => {
    res.render("register")
});
app.post("/register", (req, res) => {
    User.register({
        username: req.body.username
    }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            console.log(user)
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }

    })
})
















// User.findOne({
//     email: userEmail
// }, (err, founduser) => {
//     if (err) {
//         console.log(err);
//         res.redirect("login");
//     } else {
//         if (founduser) {
//             bcrypt.compare(userPassword, founduser.pass, (err, result) => {
//                 result ? res.render("secrets") : err
//             });
//         }
//     }
// });







app.get("/submit", (req, res) => {
    res.render("submit")
});

















app.listen(process.env.PORT, (req, res) => {
    console.log(`Your server running on port ` + process.env.PORT)
})