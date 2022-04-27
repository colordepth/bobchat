const mysql = require('mysql');

const db = mysql.createConnection({
  host     : process.env.DB_HOSTNAME,
  user     : process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  database : 'bobchat_production'
});

db.connect();

var queryCounter = 0;
var queryStartCounter = 0;

function queryExec(q) {
  console.log(queryStartCounter += 1);
  return new Promise((resolve, reject) => {
    db.query(q, (error, results, fields) => {
      if (error) return reject(error);
      console.log('.', queryCounter += 1);
      return resolve(results);
    })
  })
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function getUserByID(phone) {
  return queryExec(`
      SELECT *
      FROM bobchat_production.user
      WHERE phone = "${phone}"
    `)
    .then(results => results.length ? results[0] : null);
}

function getGroupByID(groupID) {
  return queryExec(`
      SELECT *
      FROM bobchat_production.group
      WHERE id = "${groupID}"
    `)
    .then(results => results.length ? results[0] : null);
}

function getMessageByPartialID(partialID) {
  // text, attachment, partial_id, creation_time
  return queryExec(`
      SELECT *
      FROM bobchat_production.message
      WHERE partial_id = "${partialID}"
    `)
    .then(results => results.length ? results[0] : null);
}

function getCreatorOfMessage(partialID) {
  return queryExec(`
      SELECT user_phone
      FROM bobchat_production.user_creates_message
      WHERE message_partial_id = "${partialID}"
    `)
    .then(results => results.length ? results[0].user_phone : null);
}

function getUserIDsInConversation(conversationID) {
  return queryExec(`
    SELECT user_phone
    FROM bobchat_production.user_in_conversation
    WHERE conversation_id = "${conversationID}"
  `)
  .then(results => results.map(row => row.user_phone));
}

function getUserConversationsIDs(userID) {
  return queryExec(`
    SELECT conversation_id
    FROM bobchat_production.user_in_conversation
    WHERE user_phone = "${userID}"
  `)
  .then(results => results.map(row => row.conversation_id));
}

function getUserIDsInGroup(groupID) {
  return queryExec(`
    SELECT user_phone
    FROM bobchat_production.user_in_group
    WHERE group_id = "${groupID}"
  `)
  .then(results => results.map(row => row.user_phone));
}

function getUserGroupsIDs(userID) {
  return queryExec(`
    SELECT group_id
    FROM bobchat_production.user_in_group
    WHERE user_phone = "${userID}"
  `)
  .then(results => results.map(row => row.group_id));
}

async function getUserGroups(userID) {
  const groupIDs = await getUserGroupsIDs(userID);
  const groups = Promise.all(groupIDs.map(groupID => getGroupByID(groupID)));

  return groups;
}

async function getUsersInConversation(conversationID) {
  const userIDs = await getUserIDsInConversation(conversationID);
  const users = Promise.all(userIDs.map(userID => getUserByID(userID)));

  return users;
}

async function getUsersInGroup(conversationID) {
  const userIDs = await getUserIDsInGroup(conversationID);
  const users = Promise.all(userIDs.map(userID => getUserByID(userID)));

  return users;
}

function getMessagesPartialIDsInConversation(conversationID) {
  return queryExec(`
    SELECT message_partial_id
    FROM bobchat_production.message_belongs_to_conversation
    WHERE conversation_id = "${conversationID}"
  `)
  .then(results => results.map(row => row.message_partial_id));
}

function getMessagesPartialIDsInGroup(groupID) {
  return queryExec(`
    SELECT message_partial_id
    FROM bobchat_production.message_belongs_to_group
    WHERE group_id = "${groupID}"
  `)
  .then(results => results.map(row => row.message_partial_id));
}

async function getMessagesInConversation(conversationID, offset=0, count) {
  const start = offset;
  const end = count ? start + count : Infinity;

  const messagePartialIDs = await getMessagesPartialIDsInConversation(conversationID);
  const messages = await Promise.all(messagePartialIDs
    .slice(start, end)
    .map(partialID => getMessageByPartialID(partialID))
  );

  return messages;
}

async function getMessagesInGroup(groupID, offset=0, count) {
  const start = offset;
  const end = count ? start + count : Infinity;

  const messagePartialIDs = await getMessagesPartialIDsInGroup(groupID);
  const messages = await Promise.all(messagePartialIDs
    .slice(start, end)
    .map(partialID => getMessageByPartialID(partialID))
  );

  return messages;
}

function getMessageReports(messagePartialID) {
  // user_phone, delivered_time, seen_time, message_partial_id
  return queryExec(`
    SELECT *
    FROM bobchat_production.user_receives_message
    WHERE message_partial_id = "${messagePartialID}"
  `);
}

function getUserContacts(userID) {
  return queryExec(`
    SELECT contactee_id
    FROM bobchat_production.user_contacts_user
    WHERE user_id = "${userID}"
  `);
}

module.exports = {
  queryExec,
  commonQuery: {
    getUserByID, getGroupByID, getMessageByPartialID, getUserIDsInConversation,
    getUserIDsInGroup, getMessagesPartialIDsInConversation,
    getMessagesPartialIDsInGroup, getMessageReports, getCreatorOfMessage, getUserContacts,
    getUserConversationsIDs, getUserGroupsIDs
  },
  // TODO: Modify impure queries to get result in a single query
  impureQueries: {
    getUsersInGroup, getUsersInConversation, getMessagesInConversation, getMessagesInGroup,
    getUserGroups
  }
};
