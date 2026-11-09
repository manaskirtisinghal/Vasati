const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema}=require("./schema.js");
const { reviewSchema }=require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
    //console.log(req.path,"..",req.originalUrl);
    if(!req.isAuthenticated()){
        //if user not logged in so if he is at new listing after logging he should be redirected to new not all listings
        //redirect URL save
        req.session.redirectURL = req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

//But as you login passport by default resets the session so use res.locals
module.exports.savedRedirectURL = (req,res,next) => {
    if(req.session.redirectURL) {
        res.locals.redirectURL = req.session.redirectURL;
        delete req.session.redirectURL;
    }
    next();
};

//For authorization only the owner logined should be able to update/edit and delete
module.exports.isOwner = async (req,res,next) =>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    if(!listing.owner.equals(req.user._id)){
        req.flash("error","You are not the owner to edit");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
};

module.exports.validateReview = (req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
};

//For authorization only the author who created review shoulod delete it nobody else
module.exports.isReviewAuthor = async (req,res,next) =>{
    let { id,reviewId }=req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review you requested for does not exist!");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.author.equals(req.user._id)){
        req.flash("error","You did not create this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

