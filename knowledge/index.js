const express = require("express");
const app = express();

app.get("/", (req, res) => {
  console.log("Hello world received a request.");

  const target = process.env.TARGET || "World";
  res.send(`Hello ${target}!\n`);
});

app.get("/knowledge", (req, res) => {
  res.send(`Hello knowledge`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("1Cademy listening on port", port);
});
