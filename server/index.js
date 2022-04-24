require('dotenv').config();
const http = require('http');
const app = require('./api/bobchat');
const httpServer = http.createServer(app);
const socketServer = require('./services/socket-server');

const PORT = 3001 || process.env.PORT;

httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});

socketServer.attach(httpServer);

require('./sample.js');
