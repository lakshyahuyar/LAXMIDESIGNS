require("dotenv").config();

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: true
}));

const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

const enquirySchema = new mongoose.Schema({
  name: String,
  phone: String,
  course: String,
  message: String,
  date: String
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/enquiry", async (req, res) => {
  try {
    await Enquiry.create({
      name: req.body.name,
      phone: req.body.phone,
      course: req.body.course,
      message: req.body.message,
      date: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short"
      })
    });

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send("Error saving enquiry");
  }
});

app.get("/admin/login", (req, res) => {
  res.render("login");
});

app.post("/admin/login", (req, res) => {
  if (req.body.username === ADMIN_USER && req.body.password === ADMIN_PASS) {
    req.session.admin = true;
    res.redirect("/admin");
  } else {
    res.send("Wrong username or password");
  }
});

app.get("/admin", async (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  try {
    const enquiries = await Enquiry.find().sort({ _id: -1 });
    res.render("admin", { enquiries });
  } catch (err) {
    console.log(err);
    res.send("Error loading admin panel");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Website running on port ${PORT}`);
});
