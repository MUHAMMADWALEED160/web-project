// Creates the default categories: node seedCategories.js
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

const CATEGORIES = [
  // Notices
  { name: "Exams", type: "notice" },
  { name: "Events", type: "notice" },
  { name: "Admissions", type: "notice" },
  { name: "Scholarships", type: "notice" },
  { name: "Sports", type: "notice" },
  { name: "Holidays", type: "notice" },
  { name: "Lost & Found", type: "notice" },
  // Lost & Found items
  { name: "ID Card", type: "item" },
  { name: "Phone", type: "item" },
  { name: "Bag", type: "item" },
  { name: "Keys", type: "item" },
  { name: "Wallet", type: "item" },
  { name: "Laptop", type: "item" },
  { name: "Books", type: "item" },
  { name: "Other", type: "item" }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    for (const c of CATEGORIES) {
      const exists = await Category.findOne({ name: c.name });
      if (!exists) {
        await Category.create(c);
        console.log("Added:", c.name, "(" + c.type + ")");
      } else {
        console.log("Already there:", c.name);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
