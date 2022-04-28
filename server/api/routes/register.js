const express = require('express');
const jwt = require('jsonwebtoken');
const { commonQuery } = require('../../services/db');

const registerRoute = express.Router();

registerRoute.post('/', async (req, res) => {
  const { userID, name, about } = req.body;

  if (!(userID && name && about)) {
    return res.status(400).json({ message: "Missing user info" })
  }

  const user = await commonQuery.getUserByID(userID);

  if (user) {
    return res.status(400).json({ message: "User already exists" })
  }

  await commonQuery.addUser(userID, name, about);   // remove await;

  const token = await jwt.sign(userID, process.env.JWT_SECRET);
  console.log("Added user", userID, name, about, token);

  return res.json({ userID, token })
})

module.exports = registerRoute;
