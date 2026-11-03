const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const { listingSchema, reviewSchema }=require("../schema.js");
const Listing=require("../models/listing.js");

const validateListing = (req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
};

//Index route
router.get("/",wrapAsync(async (req,res)=>{
    let allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings})
}));

router.get("/new",(req,res)=>{
    res.render("./listings/new.ejs");
});

router.post("/", validateListing, wrapAsync(async (req,res)=>{
    // if(! req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    const newListing = new Listing({
        ...req.body.listing,
        image: { url: req.body.listing.image }
    });
    await newListing.save();
    req.flash("success","New Listing created!");//key->value
    res.redirect("/listings");
}));

router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing});
}));

//Edit
router.get("/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));

//Update after edit inputted
router.patch("/:id", validateListing, wrapAsync(async (req,res)=>{
    let {id}=req.params;
    // console.log(req.body.listing);
    // console.log({...req.body.listing});
    const op = await Listing.findByIdAndUpdate(id, {
        ...req.body.listing,
        image: { url: req.body.listing.image }
    });
    //console.log(op);
    req.flash("success","Review Updated!");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);//Now findByIdAndDelet will always call the post middleware before model in listing.js
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;