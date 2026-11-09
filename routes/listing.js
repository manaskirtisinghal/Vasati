const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");
const {isOwner} = require("../middleware.js");
const {validateListing} = require("../middleware.js");

//Index route
router.get("/",wrapAsync(async (req,res)=>{
    let allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings})
}));

router.get("/new",isLoggedIn,(req,res)=>{
    res.render("./listings/new.ejs");
});

router.post("/",isLoggedIn, validateListing, wrapAsync(async (req,res)=>{
    // if(! req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    const newListing = new Listing({
        ...req.body.listing,
        image: { url: req.body.listing.image }
    });
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New Listing created!");//key->value
    res.redirect("/listings");
}));

//Show Route
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews", 
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing});
}));

//Edit
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));

//Update after edit inputted
router.patch("/:id"
    ,isLoggedIn
    ,isOwner
    ,validateListing, 
    wrapAsync(async (req,res)=>{
    let {id}=req.params;
    // console.log(req.body.listing);
    // console.log({...req.body.listing});
    const op = await Listing.findByIdAndUpdate(id, {
        ...req.body.listing,
        image: { url: req.body.listing.image }
    });
    //console.log(op);
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id"
    ,isLoggedIn
    ,isOwner
    ,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);//Now findByIdAndDelet will always call the post middleware before model in listing.js
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;
