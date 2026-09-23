const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = (async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found!");
    }
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success" , "New Review Created!");

    res.redirect(`/listings/${listing._id}`);
});

module.exports.destroyReview = (async (req, res) => {
    const listing = await Listing.findOneAndUpdate(
        { _id: req.params.id, reviews: req.params.reviewId },
        { $pull: { reviews: req.params.reviewId } },
        { new: true }
    );

    if (!listing) {
        throw new ExpressError(404, "Review Not Found!");
    }

    await Review.findByIdAndDelete(req.params.reviewId);
      req.flash("success" , "Review Deleted!");
    res.redirect(`/listings/${listing._id}`);
});
