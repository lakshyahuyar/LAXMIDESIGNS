const express = require("express");
const session = require("express-session");
const fs = require("fs");

const app = express();

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

function readData() {
  return JSON.parse(fs.readFileSync("data.json"));
}

function saveData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/enquiry", (req, res) => {
  const data = readData();

  data.enquiries.push({
    name: req.body.name,
    phone: req.body.phone,
    course: req.body.course,
    message: req.body.message,
    date: new Date().toLocaleString()
  });

  saveData(data);
  res.redirect("/");
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

app.get("/admin", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  const data = readData();
  res.render("admin", { enquiries: data.enquiries });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Website running on http://localhost:3000");
});