const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6aa98e58159a11e5e9dd1090",
        geometry: { type: "Point", coordinates: [77.2090, 28.6139] }
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

main()
    .then(() => {
        console.log("Connected to DB");
        return initDB();
    })
    .then(() => mongoose.connection.close())
    .catch((err) => {
        console.log(err);
        mongoose.connection.close();
    });
