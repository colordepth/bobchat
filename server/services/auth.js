const jwt = require('jsonwebtoken');
const { commonQuery } = require('./db');

async function getUserIDfromToken(token) {
  try {
    if (!(await jwt.verify(token, process.env.JWT_SECRET))) {
      return null;
    }

    return await jwt.decode(token);
  }
  catch(err) {
    return null;
  }
}

async function getUserFromToken(token) {
  const userID = await getUserIDfromToken(token);

  if (!userID) {
    return null;
  }

  return await commonQuery.getUserByID(userID);
}

function getUserFromRequest(req) {
  const auth = req.get('Authorization');

  if (!(auth && auth.startsWith('bearer '))) {
    return null;
  }

  const token = auth.substring(7);

  return getUserFromToken(token);
}

module.exports = { getUserFromRequest, getUserFromToken, getUserIDfromToken };
