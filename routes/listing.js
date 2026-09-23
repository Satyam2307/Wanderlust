const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const {isLoggedIn, isOwner , validateListing} = require("../middleware.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingcontroller = require("../controllers/listing.js");

router
.route("/")
.get(wrapAsync(listingcontroller.index))
.post(isLoggedIn , validateListing,
upload.single('listing[image]'),
wrapAsync(listingcontroller.createListing)
);

//New Route
router.get("/new", isLoggedIn , listingcontroller.renderNewForm);

router.route("/:id")
.get( wrapAsync(listingcontroller.showListing))
.put(isLoggedIn ,isOwner,upload.single('listing[image]'),
validateListing, wrapAsync(listingcontroller.updateListing))
.delete(isLoggedIn ,isOwner, wrapAsync(listingcontroller.deleteListing));

//Edit Route
router.get("/:id/edit",isLoggedIn ,isOwner, wrapAsync(listingcontroller.renderEditForm));

module.exports = router;