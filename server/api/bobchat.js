const express = require("express");
const path = require("path");
const app = express();

const loginRoute = require(path.join(__dirname, "routes/login"));
const userRoute = require(path.join(__dirname, "routes/user"));
const chatRoute = require(path.join(__dirname, "routes/chat"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));

app.use('/login', loginRoute);
app.use('/user', userRoute);
app.use('/chat', chatRoute);

module.exports = app;
