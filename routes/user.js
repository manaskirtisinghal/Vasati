const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectURL } = require("../middleware.js");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async(req, res,next)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",
    savedRedirectURL,
    passport.authenticate("local",{
        failureRedirect: '/login',
        failureFlash:true
    }), 
    async(req,res)=>{
        req.flash("success","Welcome to Wanderlust! You are logged in");
        res.redirect(res.locals.redirectURL || "/listings");
        //But as you login passport by default resets the session so use res.locals
    }
);

router.get("/logout",(req,res)=>{//Using passport serialize and deserialize it itself delete users
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    });
});

//Now after one signUp bydeafault login should be their so implement that also

module.exports=router;

// const bcrypt = require("bcrypt");
// const User = require("./models/user");

// async function authenticate(username, password) {

//     // Step 1: Retrieve all users
//     const users = await User.find();

//     // Step 2: Create an array of usernames
//     const usernames = users.map(user => user.username);

//     // Step 3: Check whether username exists
//     if (!usernames.includes(username)) {
//         return "User not found";
//     }

//     // Step 4: Retrieve the particular user
//     const user = users.find(u => u.username === username);

//     // Step 5: Compare entered password with stored hash
//     const isMatch = await bcrypt.compare(
//         password,
//         user.password
//     );

//     // Step 6: Authenticate
//     if (isMatch) {
//         return "Login successful";
//     } else {
//         return "Invalid password";
//     }
// }
//Now if a user clicked new listings and we asked him to log in first then he should be redirected to new listing page not all listings page by default as website should be easy to use
