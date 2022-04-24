const express = require("express");
const path = require("path");
const app = express();

const loginRoute = require(path.join(__dirname, "routes/login"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

app.use('/login', loginRoute);

module.exports = app;
