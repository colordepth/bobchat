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

  commonQuery.setDeliveredTime(user.phone);

  const chat = await getChatFromUserID(user.phone);
  res.json(chat);
});

chatRoute.patch('/group/:id', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  console.log("Group received patch");
  const messageIDs = await commonQuery.getMessagesPartialIDsInGroup(req.params.id);
  await commonQuery.setSeenTimeMessages(user.phone, messageIDs);
  res.status(200).end();
});

chatRoute.get('/group', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const messages = (await commonQuery.getAllGroupMessages(user.phone)).map(message => {
    return {
      ...message,
      attachment: !!message.attachment
    }
  });

  res.json(messages);
});

chatRoute.get('/attachment/:partialID', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const { partialID } = req.params;

  if (!partialID) return res.status(400).end();

  const message = await commonQuery.getMessageByPartialID(partialID);

  res.json({ filename: message.text, attachment: message.attachment });
});

chatRoute.get('/conversation', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const messages = (await commonQuery.getAllConversationMessages(user.phone)).map(message => {
    return {
      ...message,
      attachment: !!message.attachment
    }
  });

  res.json(messages);
});

chatRoute.patch('/conversation/:id', async (req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  console.log("Conversation received patch");
  const messageIDs = await commonQuery.getMessagesPartialIDsInConversation(req.params.id);
  await commonQuery.setSeenTimeMessages(user.phone, messageIDs);
  res.status(200).end();
});

chatRoute.get('/receipts', async(req, res) => {
  const user = await getUserFromRequest(req);

  if (!user) return res.status(401).end();

  const groupReceipts = await commonQuery.getGroupReceipts(user.phone);
  const conversationReceipts = await commonQuery.getConversationReceipts(user.phone);

  res.json({receipts: [...groupReceipts, ...conversationReceipts]});
})

module.exports = chatRoute;
