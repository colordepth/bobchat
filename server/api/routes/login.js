const express = require('express');
const jwt = require('jsonwebtoken');
const { commonQuery } = require('../../services/db');

const loginRoute = express.Router();

loginRoute.post('/', async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ error: "Missing userID" })
  }

  const user = await commonQuery.getUserByID(userID);

  if (!user) {
    return res.status(401).end();
  }

  const token = await jwt.sign(userID, process.env.JWT_SECRET);

  return res.json({ userID, token })
})

module.exports = loginRoute;
