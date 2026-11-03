const express = require("express");
const app=express();
const users=require("./routes/user.js");
const posts=require("./routes/post.js");
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));


const session = require("express-session");
const flash=require("connect-flash");

const sessionOptions = {
    secret: "mysupersecretstring", 
    resave: false, 
    saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(flash());

app.get("/register",(req,res)=>{
    let { name="anonymous" } = req.query;
    //create-storing information of a session
    req.session.name=name;
    //Message should flash only when new user enters which means different session which is different session_id
    //Flash example , only when a new user logins then welcome if the page reloads but user no welcome msg
    if(name=="anonymous") req.flash("error","user not registered!");
    else req.flash("success","user registered successfully!");//Key - value
    res.redirect("/hello");
});

app.get("/hello",(req,res)=>{
    res.locals.SuccessMsg = req.flash("success");//matlab directly render alg se no need to write in render
    res.locals.ErrorMsg = req.flash("error");
    res.render("page.ejs",{name:req.session.name});//getting->accessing stored information
});

app.get("/test",(req,res)=>{
    res.send("test successful!");
});

//In place of temporary storage in production level code we can use cassandr-store , connect-redis , etc compatible session stores

//connect-flash:The flash is a special area of the session used for storing messages, Messages are 
//written to the flash and cleared after being displayed to the user.Generally used after saving and before res.render()




app.listen(3000,()=>{
    console.log("server is listening to 3000");
});


// /register
//     ↓
// flash("success", "Registered!")
//     ↓
// redirect("/hello")
//     ↓
// /hello
//     ↓
// flash("success")  ← READ + REMOVE
//     ↓
// Message displayed
//     ↓
// Reload /hello
//     ↓
// flash("success")  ← nothing there
//     ↓
// No message

