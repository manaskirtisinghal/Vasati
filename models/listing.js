const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type:String,
            default:"https://images.unsplash.com/photo-1547699224-0924faf995c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MXxzZWFyY2h8NHx8ZG93bmxvYWR8fDB8fHx8MTYxOTIwODA3NQ&ixlib=rb-1.2.1&q=80&w=1080",
            set: (v) => v===""?"https://images.unsplash.com/photo-1547699224-0924faf995c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MXxzZWFyY2h8NHx8ZG93bmxvYWR8fDB8fHx8MTYxOTIwODA3NQ&ixlib=rb-1.2.1&q=80&w=1080":v
        }
    },
    price:{
        type:Number
    },
    location:{
        type:String
    },
    country:{
        type:String
    },
    reviews:[
        {
        type:Schema.Types.ObjectId,
        ref:"Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete",async (listing) => {
    if(listing){
        await Review.deleteMany({_id:{ $in: listing.reviews } });
    }
});

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;