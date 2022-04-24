const mysql = require('mysql');

const db = mysql.createConnection({
  host     : process.env.DB_HOSTNAME,
  user     : process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  database : 'bobchat_production'
});

db.connect();

function queryDB(q) {
  return new Promise((resolve, reject) => {
    db.query(q, (error, results, fields) => {
      if (error) return reject(error);
      return resolve(results);
    })
  })
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function getUserByID(phone) {
  return queryDB(`
      SELECT *
      FROM bobchat_production.user
      WHERE phone = "${phone}"
    `)
    .then(results => results.length && results[0]);
}

function getGroupByID(groupID) {
  return queryDB(`
      SELECT *
      FROM bobchat_production.group
      WHERE id = "${groupID}"
    `)
    .then(results => results.length && results[0]);
}

function getMessageByPartialID(partialID) {
  // text, attachment, partial_id, creation_time
  return queryDB(`
      SELECT *
      FROM bobchat_production.message
      WHERE partial_id = "${partialID}"
    `)
    .then(results => results.length && results[0]);
}

function getCreatorOfMessage(partialID) {
  return queryDB(`
      SELECT user_phone
      FROM bobchat_production.user_creates_message
      WHERE message_partial_id = "${partialID}"
    `)
    .then(results => results.length && results[0]);
}

function getUserIDsInConversation(conversationID) {
  return queryDB(`
    SELECT user_phone
    FROM bobchat_production.user_in_conversation
    WHERE conversation_id = "${conversationID}"
  `);
}

function getUserIDsInGroup(groupID) {
  return queryDB(`
    SELECT user_phone
    FROM bobchat_production.user_in_group
    WHERE group_id = "${groupID}"
  `);
}

async function getUsersInConversation(conversationID) {
  const userIDs = await getUserIDsInConversation(conversationID);
  const users = userIDs.map(async userID => await getUserByID(userID));

  return users;
}

async function getUsersInGroup(conversationID) {
  const userIDs = await getUserIDsInGroup(conversationID);
  const users = userIDs.map(async userID => await getUserByID(userID));

  return users;
}

function getUserConversationIDs(userID) {
  return queryDB(`
    SELECT conversation_id
    FROM bobchat_production.user_in_conversation
    WHERE user_phone = "${userID}"
  `);
}

function getMessagesPartialIDsInConversation(conversationID) {
  return queryDB(`
    SELECT message_partial_id
    FROM bobchat_production.message_belongs_to_conversation
    WHERE conversation_id = "${conversationID}"
  `);
}

function getMessagesPartialIDsInGroup(groupID) {
  return queryDB(`
    SELECT message_partial_id
    FROM bobchat_production.message_belongs_to_group
    WHERE group_id = "${groupID}"
  `);
}

async function getMessagesInConversation(conversationID) {
  const messagePartialIDS = await getMessagesPartialIDsInConversation(conversationID);
  const messages = messagePartialIDS.map(async partialID => await getMessageByPartialID(partialID));

  return messages;
}

async function getMessagesInGroup(groupID) {
  const messagePartialIDS = await getMessagesPartialIDsInGroup(groupID);
  const messages = messagePartialIDS.map(async partialID => await getMessageByPartialID(partialID));

  return messages;
}

function getMessageReports(messagePartialID) {
  // user_phone, delivered_time, seen_time, message_partial_id
  return queryDB(`
    SELECT *
    FROM bobchat_production.user_receives_message
    WHERE message_partial_id = "${messagePartialID}"
  `);
}

function getUserContacts(userID) {
  return queryDB(`
    SELECT contactee_id
    FROM bobchat_production.user_contacts_user
    WHERE user_id = "${userID}"
  `);
}

module.exports = {
  queryDB,
  commonQuery: {
    getUserByID, getGroupByID, getMessageByPartialID, getUserIDsInConversation,
    getUserIDsInGroup, getUserConversationIDs, getMessagesPartialIDsInConversation,
    getMessagesPartialIDsInGroup, getMessageReports, getCreatorOfMessage, getUserContacts
  },
  // TODO: Modify impure queries to get result in a single query
  impureQueries: {
    getUsersInGroup, getUsersInConversation, getMessagesInConversation, getMessagesInGroup
  }
};
