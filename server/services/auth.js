const jwt = require('jsonwebtoken');
const { commonQuery } = require('./db');

async function getUserFromToken(token) {
  try {
    if (!(await jwt.verify(token, process.env.JWT_SECRET))) {
      return null;
    }

    const userID = await jwt.decode(token);
    return await commonQuery.getUserByID(userID);
  }
  catch(err) {
    return null;
  }
}

function getUserFromRequest(req) {
  const auth = req.get('Authorization');

  if (!(auth && auth.startsWith('bearer '))) {
    return null;
  }

  const token = auth.substring(7);

  return getUserFromToken(token);
}

module.exports = { getUserFromRequest, getUserFromToken };
