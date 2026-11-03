const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings=require("./routes/listing.js");
const reviews=require("./routes/reviews.js");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.engine("ejs", ejsMate);

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"; 

main()
    .then((res)=>{
        console.log("Connection Successful");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL);
}

const sessionOptions = {
    secret: "mysupersecretstring", 
    resave: false, 
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,//Date set to after 7 days
        httpOnly:true,//to prevent croos-cryptic attacks->means javascript can't read the cookies
    }
};//To make a session(between user/browser and server) for purpose like temporary storage etc, a session ID with whatever items inside is their which is signed using secret code to maintain data integrity(i.e, nobody can hamper it)

app.get("/",(req,res)=>{
    res.send("Root Page");
});

app.use(session(sessionOptions));
app.use(flash());
//Pehle flash aayenge fir routes hamare page ke andar

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});//Flash basically in listing.js to send welcome message after new listing created so ejs template not direct access to flash message.Hence, accessed using res.locals

// app.get("/testListing",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log(sampleListing);
//     res.send("Done!");
// });

app.use("/listings",listings);

app.use("/listings/:id/reviews",reviews)

//Just to check error if any path does not match
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next)=>{
    const { statusCode = 500, message = "Something went wrong!" } = err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{err});
});

app.listen(8080,()=>{
    console.log("App is listening on port 8080");
});

//Sabse pehle frontend par required and bootsttrap se error handle 
//Errors sabse pehle do wrapAsync aur ExpressError Banano taki error directly wrapAsync se 
//middleware ke pass aur all path ka error and middleware ke pass taki app not crash
//Baad mein user aesthetics ke liye alag se error.ejs

//Uske baad see if listing jo humne new add karwayi what if null or any other like description , title etc because at fromtend handled throug required but through hopscoch one can send 
//Schema validation ke liye u wont wriye multiple if statementas
//like if(!newListing.title) throw new ExpressError()
//like if(!newListing.description) throw new ExpressError()
//like if(!newListing.location) throw ExpressError()
//Use JOI for schema validation -> https://joi.dev/api/18.x.x
//JOI defines a schema for server side validation

//Now converted to routes
//After that cookies(piece of data) for personalization 
//U send some cookies res.cookie()
//Now u want to your other page to accesss cookies use console.dir(req.cookie) but also with a app.use(cookieParser()) middleware

// ==================== SIGNED COOKIES ====================

// -------- Send Signed Cookie --------

// cookie-parser middleware with a secret key
//app.use(cookieParser("secretcode"));

// Route to send a signed cookie
// app.get("/getsignedcookie", (req, res) => {

//     // Create a cookie named "color" with value "red"
//     // signed: true means the cookie will be digitally signed
//     res.cookie("color", "red", { signed: true });

//     // Send response to the client
//     res.send("done!");
// });


// -------- Verify Signed Cookie --------

// Route to verify/read the signed cookie
// app.get("/verify", (req, res) => {

//     // req.signedCookies contains all verified signed cookies
//     // Send the signed cookies as the response
//     res.send(req.signedCookies);
// });

//U sign cookies eg u send color red but on browser manually tamper to yellow so signed cookies should be send

//For express signedCookies and cookies(unsigned ones only)
//If u tampered change whole value empty object
//only Value false returned

//https://academo.org/demos/SHA-256-hash-generator/->link for SHA256
