if(process.env.NODE_ENV !== "production") { 
require('dotenv').config({ quiet: true });
};

const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const dbUrl= process.env.ATLASDB_URL; // Atlas DB URL from .env file
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Review= require("./models/review.js");

// const listings = require("./Routes/listing.js");
// const reviews = require("./Routes/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRoutes = require("./Routes/listing.js");
const reviewRoutes= require("./Routes/review.js");
const userRoutes = require("./Routes/user.js");
const Listing = require("./models/listing.js");


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret:process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});
const sessionoptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
  
};


// Root route
// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

 



app.use(session(sessionoptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.mapToken = process.env.MAP_TOKEN;
   next();
});

 

// const validateListing =(req, res, next)=> {
//   let{error} =listingSchema.validate(req.body);
//   if(error){
//     let errMsg= error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg)
//   }else{
//     next();
//   }
// };
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// app.get("/", async (req, res) => {
//   const listings = await Listing.find({});
//   res.render("listings/index", { listings });
// });
 


app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes); 

// Catch-all for unmatched routes (404 handler)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error handler middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs",{message});
  
});
app.listen(8080, () => {
  console.log("server is listening to port 8080 ");
});
