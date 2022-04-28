const express = require('express');
const { getUserFromRequest } = require('../../services/auth');
const { commonQuery, impureQueries } = require('../../services/db');

const chatRoute = express.Router();

async function getChatFromUserID(userID) {
  const contacts = await commonQuery.getUserContacts(userID);
  const groupsInfo = await impureQueries.getUserGroups(userID);
  const conversationIDs = await commonQuery.getUserConversationsIDs(userID);

  const conversations = await Promise.all(conversationIDs.map(async id => {
    const partner = (await impureQueries.getUsersInConversation(id)).find(user => user.phone !== userID);
    return {
      ...partner,
      id,
      partnerID: partner.phone,
      isGroup: false
    }
  }));

  const groups = await Promise.all(groupsInfo.map(async groupInfo => {
    return {
      ...groupInfo,
      partnerID: groupInfo.id,
      users: await impureQueries.getUsersInGroup(groupInfo.id),
      isGroup: true
    }
  }));
  return { contacts, groups, conversations };
}

chatRoute.get('/', async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).end();

  const chat = await getChatFromUserID(user.phone);
  res.json(chat);
});

chatRoute.get('/group/:id', async (req, res) => {
  const user = await getUserFromRequest(req);
  const { offset, count } = req.query;

  if (!user) return res.status(401).end();

  // Check if user belongs to group

  const messages = await impureQueries.getMessagesInGroup(req.params.id, offset, count);

  res.json(messages);
});

chatRoute.get('/group', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const messages = await commonQuery.getAllGroupMessages(user.phone);

  res.json(messages);
});

chatRoute.get('/conversation', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const messages = await commonQuery.getAllConversationMessages(user.phone);

  res.json(messages);
});

chatRoute.get('/conversation/:id', async (req, res) => {
  const user = await getUserFromRequest(req);
  const { offset, count } = req.query;

  if (!user) return res.status(401).end();

  const messages = await impureQueries.getMessagesInConversation(req.params.id, offset, count);

  res.json(messages);
});

module.exports = chatRoute;
