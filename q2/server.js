const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

const users = {
  a: { username: "a", password: "a123" },
  om: { username: "om", password: "om123" },
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new FileStore({ path: "./sessions" }),
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (user && user.password === password) {
    req.session.username = username;
    res.redirect("/home");
  } else {
    res.send(
      'Invalid username or password. <a href="/login.html">Try again</a>'
    );
  }
});

app.get("/home", (req, res) => {
  if (req.session.username) {
    res.send(`Welcome, ${req.session.username}! <a href="/logout">Logout</a>`);
  } else {
    res.redirect("/login.html");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.redirect("/login.html");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
