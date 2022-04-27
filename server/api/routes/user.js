const express = require('express');
const { getUserFromRequest } = require('../../services/auth');
const { commonQuery } = require('../../services/db');

const userRoute = express.Router();

userRoute.post('/', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  console.log('received POST', userID);
})

userRoute.get('/', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const contacts = commonQuery.getUserContacts(user.phone);
  console.log('received GET', contacts);

  res.json({...user, contacts});
})

userRoute.get('/:userID', async (req, res) => {
  const userID = req.params.userID;
  const user = await commonQuery.getUserByID(userID);

  if (!user) return res.status(404).end();

  res.json(user);
})

userRoute.post('/contact', async (req, res) => {
  const user = getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const contact = !isNaN(req.body) && await commonQuery.getUserByID(req.body);

  if (!contact) return res.status(400).end();

  commonQuery.addContact(user.id, contact.id);

  res.json(contact);
})

module.exports = userRoute;
