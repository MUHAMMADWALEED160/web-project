require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const Notice = require("./models/Notice");
const Item = require("./models/LostFoundItem");

const app = express();

// View engine (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sessions (stored in MongoDB)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

// Available in every EJS view: logged-in user, flash message, date helpers
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;

  // 18 Nov 2026
  res.locals.fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
  // 2026-11-18 (for date inputs)
  res.locals.inputDate = (d) => {
    const x = new Date(d);
    const p = (n) => String(n).padStart(2, "0");
    return x.getFullYear() + "-" + p(x.getMonth() + 1) + "-" + p(x.getDate());
  };
  // Bootstrap colour for a Lost/Found status
  res.locals.statusClass = (s) =>
    ({ lost: "danger", found: "success", claimed: "warning text-dark", returned: "secondary" }[s] || "secondary");
  next();
});

// Routes
app.get("/", async (req, res, next) => {
  try {
    const [notices, found] = await Promise.all([
      Notice.find(Notice.activeFilter())
        .populate("category")
        .sort({ isPinned: -1, publishDate: -1 })
        .limit(3),
      Item.find({ approval: "approved", type: "found", status: "found" })
        .populate("category")
        .sort({ createdAt: -1 })
        .limit(3)
    ]);
    res.render("index", { title: "Home", notices, found });
  } catch (err) {
    next(err);
  }
});
app.use("/", require("./routes/auth"));
app.use("/notices", require("./routes/notices"));
app.use("/items", require("./routes/items"));
app.use("/display", require("./routes/display"));
app.use("/admin", require("./routes/admin"));
app.use("/admin", require("./routes/adminItems"));
app.use("/admin", require("./routes/adminStats"));
app.use("/admin", require("./routes/adminUsers"));

// 404
app.use((req, res) => {
  res.status(404).render("404", { title: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server error. Check the terminal for details.");
});

// Connect DB, then start server
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
