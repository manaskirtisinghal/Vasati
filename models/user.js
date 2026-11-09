const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema= new Schema({
    email: {
        type: String,
        required: true,
    },
});

//username , salt . hash will be automatically created by passport

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);