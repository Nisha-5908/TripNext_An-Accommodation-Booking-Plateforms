const express = require("express");
const router = express.Router(); 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
//index Route

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, 
  upload.single('listing[image]'), 
  validateListing,
  wrapAsync( listingController.createListings));

 

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm); 
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
  isLoggedIn,
  isOwner,
upload.single('listing[image]'), 
validateListing,
wrapAsync (listingController.UpdateListings))
.delete(
  isLoggedIn,
  isOwner,
 wrapAsync (listingController.DestroyListings));

module.exports = router;

// Edit Route
router.get("/:id/edit", isLoggedIn,   isOwner,
 wrapAsync( listingController.renderEditForm)
);
module.exports = router;