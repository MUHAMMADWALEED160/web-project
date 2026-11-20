// Creates the admin account: node seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const ADMIN = {
  name: "Admin",
  email: "admin@uni.edu",
  password: "Admin12345", // change this after the first login
  role: "admin",
  department: "Administration"
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const exists = await User.findOne({ email: ADMIN.email });
    if (exists) {
      console.log("Admin already exists:", ADMIN.email);
    } else {
      await User.create(ADMIN);
      console.log("Admin created!");
      console.log("Email:", ADMIN.email);
      console.log("Password:", ADMIN.password);
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
