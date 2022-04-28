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

  res.json(user);
})

userRoute.get('/:userID', async (req, res) => {
  const userID = req.params.userID;
  const user = await commonQuery.getUserByID(userID);

  if (!user) return res.status(404).end();

  res.json(user);
})

userRoute.post('/contact', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const contact = !isNaN(req.body.contact) && await commonQuery.getUserByID(req.body.contact);
  if (!contact) return res.status(400).end();

  commonQuery
    .addContact(user.phone, contact.phone)
    .catch(error => {
      // Entry already exists prolly.
    })

  res.json(contact);
})

userRoute.post('/conversation', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const contact = !isNaN(req.body.contact) && await commonQuery.getUserByID(req.body.contact);
  if (!contact) return res.status(400).end();

  commonQuery
    .addConversation(user.phone, contact.phone)
    .then(conversationID => {
      res.json({...contact, id: conversationID, partnerID: contact.phone})
    })
    .catch(error => {
      // Entry already exists prolly.
    })
})

module.exports = userRoute;
