const express = require('express');
const { getUserFromRequest } = require('../../services/auth');
const { commonQuery, impureQueries } = require('../../services/db');

const userRoute = express.Router();

userRoute.put('/', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  console.log('received POST', req.body);
  commonQuery.updateUser(user.phone, req.body)
    .then(() => {
      res.json({...user, ...req.body});
    })
    // .catch(() => {
    // malformatted
    //   res.status(400).end()
    // })
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
      res.json({...contact, id: conversationID, partnerID: contact.phone, isGroup: false})
    })
    .catch(error => {
      //
    })
})

userRoute.post('/group', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const { name, description, members } = req.body;

  console.log('/group', name, description, members);

  if (!(name && description && members && members.length))
    return res.status(400).end();

  commonQuery
    .addGroup(name, description, members, user.phone)
    .then(async groupID => {
      console.log("Returned with", groupID);
      res.json({
        name,
        description,
        id: groupID,
        partnerID: groupID,
        isGroup: true,
        users: await commonQuery.getUsersByIDs(members)
      })
    })
})

module.exports = userRoute;
