const express = require("express");
const path = require("path");
const app = express();

const loginRoute = require(path.join(__dirname, "routes/login"));
const registerRoute = require(path.join(__dirname, "routes/register"));
const userRoute = require(path.join(__dirname, "routes/user"));
const chatRoute = require(path.join(__dirname, "routes/chat"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: true }));

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/user', userRoute);
app.use('/chat', chatRoute);

module.exports = app;
