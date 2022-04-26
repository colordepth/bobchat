const { queryExec, commonQuery } = require('./services/db');

queryExec('SELECT * FROM bobchat_production.user')
  .then(results => console.log(results.length && results[0]))
  .catch(error => console.error(error));

commonQuery.getUserByID(806501618)
  .then(user => console.log(user))
  .catch(error => console.error(error));
