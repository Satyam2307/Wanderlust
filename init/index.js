const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLAS_DB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

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

    console.log("Geocoding listings with Mapbox...");
    const preparedListings = [];
    for (let obj of initData.data) {
        let geometry = { type: "Point", coordinates: [77.2090, 28.6139] };
        if (geocodingClient && (obj.location || obj.country)) {
            try {
                const geoQuery = `${obj.location || ""}, ${obj.country || ""}`.trim();
                const geoRes = await geocodingClient.forwardGeocode({
                    query: geoQuery,
                    limit: 1
                }).send();
                if (geoRes.body.features && geoRes.body.features.length) {
                    geometry = geoRes.body.features[0].geometry;
                }
            } catch (err) {
                console.log(`Geocoding error for ${obj.title}:`, err.message);
            }
        }

        preparedListings.push({
            ...obj,
            owner: ownerUser._id,
            geometry,
        });
    }

    // 2. Clear and seed listings with accurate coordinates
    await Listing.deleteMany({});
    await Listing.insertMany(preparedListings);
    console.log(`Successfully initialized ${preparedListings.length} listings with accurate geolocations in the database!`);
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
