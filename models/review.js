const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 80,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    rating : {
        type : Number,
        min : 1,
        max : 5,
        required: true,
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
});

module.exports = mongoose.model("Review" , reviewSchema);
