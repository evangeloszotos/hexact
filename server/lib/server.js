const express = require("express");
const path = require("path");

const app = express();
const port = 4000;

const publicFolderPath = path.join(__dirname, "../public");
const indexHtmlPath = path.join(publicFolderPath, "index.html");

app.get("/api", (req, res) => {
  res.send("/api");
});

app.get("/code", (req, res) => {
  res.send("/code");
});

// register static file middle ware
app.use(express.static(publicFolderPath));

// register send always index.html if route nont found
app.get("/*", (req, res) => {
  res.sendFile(indexHtmlPath);
});

app.listen(port, () => {
  console.log("Server listening on port: " + port);
});
