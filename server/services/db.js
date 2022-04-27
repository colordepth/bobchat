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

  return queryExec(`
    SELECT 
        group_user_rel.name, group_user_rel.description, group_user_rel.id
    FROM 
      bobchat_production.user
    INNER JOIN
    (	SELECT 
        *
      FROM 
        bobchat_production.group
      INNER JOIN 
        user_in_group
      ON
        bobchat_production.group.id = user_in_group.group_id)
    AS group_user_rel
    ON
      group_user_rel.user_phone = bobchat_production.user.phone
        AND bobchat_production.user.phone = ${userID};
    `
  );
}

async function getUsersInConversation(conversationID) {
  return queryExec(`
    SELECT user.*
    FROM
      user
    INNER JOIN
      user_in_conversation
    ON
    user_in_conversation.user_phone=user.phone
      AND user_in_conversation.conversation_id=${conversationID}
  `);
}

async function getUsersInGroup(groupID) {
  return queryExec(`
    SELECT user.*
    FROM
      user
    INNER JOIN
      user_in_group
    ON
      user_in_group.user_phone=user.phone
      AND user_in_group.group_id=${groupID}
  `);
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
  SELECT phone, name, about, last_seen_on_setting, about_visibility_setting, read_receipt_setting
  FROM user_contacts_user
  INNER JOIN
    user
  ON
    user_id=${userID} AND
      contactee_id=user.phone
  
  `);
}

function getAllGroupMessages(userID) {
  return queryExec(`
  SELECT   
	creator_id,
	group_id,
    seen_time,
    delivered_time,
    creation_time,
    attachment,
    text 
FROM  
	message_belongs_to_group
INNER JOIN( 
			SELECT 
				user_message_rel.*,
                user_creates_message.user_phone AS creator_id
            FROM
				user_creates_message
			INNER JOIN(
				SELECT  
					delivered_time,
                    seen_time,
                    user_receives_message.message_partial_id,
                    text,
                    attachment,
                    creation_time
				FROM    
					user_receives_message  
				INNER JOIN   
					message  
				ON    
				user_receives_message.message_partial_id=message.partial_id     
				AND user_phone=${userID}) AS user_message_rel
                ON
					user_message_rel.message_partial_id=user_creates_message.message_partial_id
                )
		AS user_create_message_rel 
		ON  user_create_message_rel.message_partial_id=message_belongs_to_group.message_partial_id
  `);
}

function getAllConversationMessages(userID) {
  return queryExec(`
  SELECT   
	conversation_id,
    seen_time,
    delivered_time,
    creation_time,
    attachment,
    text 
FROM  
	message_belongs_to_conversation
INNER JOIN(  
			SELECT *  
			FROM    
				user_receives_message  
			INNER JOIN   
				message  
			ON    
				user_receives_message.message_partial_id=message.partial_id
				AND user_phone=${userID}) 
		AS user_message_rel 
		ON  
			user_message_rel.message_partial_id=message_belongs_to_conversation.message_partial_id
  `);
}

var lastPartialID;

queryExec(`
    SELECT MAX(partial_id)
    FROM message
  `)
  .then(results => results.map(result => result['MAX(partial_id)']))
  .then(results => results.length===0 ? 0 : results[0])
  .then(id => {lastPartialID = id})

async function addMessageToGroup(message, groupID, creatorID) {
  console.log("Last partial id", lastPartialID);
  lastPartialID += 1;

  queryExec(`
    INSERT INTO message (partial_id, text, attachment, creation_time)
    VALUES
      (
        ${lastPartialID + 1}, '${message.text}', ${message.attachment},
        '${message.creation_time.toISOString().replace('T', ' ').slice(0, -5)}'
      )
  `);
  queryExec(`
    INSERT INTO message_belongs_to_group (message_partial_id, group_id)
    VALUES
      (${lastPartialID + 1}, ${groupID})
  `);
  queryExec(`
    INSERT INTO user_creates_message (user_phone, message_partial_id)
    VALUES
      (${creatorID}, ${lastPartialID + 1})
  `);
}

async function addMessageToConversation(message, conversationID, creatorID) {
  console.log("Last partial id", lastPartialID);

  lastPartialID += 1;

  queryExec(`
    INSERT INTO message (partial_id, text, attachment, creation_time)
    VALUES
      (
        ${lastPartialID + 1}, '${message.text}', ${message.attachment},
        '${message.creation_time.toISOString().replace('T', ' ').slice(0, -5)}'
      )
  `);
  queryExec(`
    INSERT INTO message_belongs_to_conversation (message_partial_id, conversation_id)
    VALUES
      (${lastPartialID + 1}, ${conversationID})
  `);
  queryExec(`
    INSERT INTO user_creates_message (user_phone, message_partial_id)
    VALUES
      (${creatorID}, ${lastPartialID + 1})
  `);
}

function addContact(userID, contactID) {
  return queryExec(`
    INSERT INTO user_contacts_user (user_id, contactee_id)
    VALUES
      (${userID}, ${contactID})
  `);
}

module.exports = {
  queryExec,
  commonQuery: {
    getUserByID, getGroupByID, getMessageByPartialID, getUserIDsInConversation,
    getUserIDsInGroup, getMessagesPartialIDsInConversation,
    getMessagesPartialIDsInGroup, getMessageReports, getCreatorOfMessage, getUserContacts,
    getUserConversationsIDs, getUserGroupsIDs, getAllGroupMessages, getAllConversationMessages,
    addContact
  },
  // TODO: Modify impure queries to get result in a single query
  impureQueries: {
    getUsersInGroup, getUsersInConversation, getMessagesInConversation, getMessagesInGroup,
    getUserGroups, addMessageToGroup, addMessageToConversation
  }
};
