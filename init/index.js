const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLAS_DB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    // 1. Ensure owner user exists so listings are properly owned
    const ownerId = "6aa98e58159a11e5e9dd1090";
    let ownerUser = await User.findById(ownerId);
    if (!ownerUser) {
        ownerUser = await User.findOne({ username: "sigma-std" });
    }
    if (!ownerUser) {
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(ownerId),
            email: "student@gmail.com",
            username: "sigma-std",
        });
        ownerUser = await User.register(newUser, "student123");
        console.log("Initialized owner user: sigma-std");
    }

    // 2. Clear and seed listings
    await Listing.deleteMany({});
    const preparedListings = initData.data.map((obj) => ({
        ...obj,
        owner: ownerUser._id,
        geometry: obj.geometry || { type: "Point", coordinates: [77.2090, 28.6139] },
    }));

    await Listing.insertMany(preparedListings);
    console.log(`Successfully initialized ${preparedListings.length} listings in the database!`);
};

main()
    .then(() => {
        console.log("Connected to DB:", dbUrl.includes("@") ? "MongoDB Atlas" : "Local MongoDB");
        return initDB();
    })
    .then(() => mongoose.connection.close())
    .catch((err) => {
        console.error("Initialization error:", err);
        mongoose.connection.close();
    });
