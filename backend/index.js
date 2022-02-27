const express = require('express');
const https = require('https');
const app = express();
const users = require('./routes/users');
const publisher = require('./mechanics/publisher');
const subscriber = require('./history/subscriber');
const mechnicsSubscriver = require('./mechanics/subscriber');
const chats = require('./routes/chats');
const bets = require('./routes/bets');
const gameResult = require('./routes/gameResults');
const chatPublisher = require('./chat/publisher');
const editedMessagePublisher = require('./chat/editedMessagePublisher');
const messageChecker = require('./chat/messageChecker');
const quotes = require('./quotes/sse');
const historyRefreshd = require('./history/historyRefresh');
const fs = require('fs');
const cors = require('cors');
app.use(cors());
require('dotenv').config();
app.use(express.json());

try {
  require('./config/neo4jDriver');

  app.use('/users', users);
  app.use('/bets', bets);
  app.use('/game/result', gameResult);
  app.use('/chats', chats);
  app.use('/quotes', quotes);

  console.log(`Connected to Neo4J.`);
  const port = process.env.PORT || 5000;
  https
    .createServer(
      {
        key: fs.readFileSync('../certyfikat/klucz2.key'),
        cert: fs.readFileSync('../certyfikat/certyfikat.crt'),
      },
      app
    )
    .listen(port, () => {
      console.log(`API server listening at https://localhost:${port}`);
    });
} catch (ex) {
  console.error('Error connecting to Neo4J', ex);
}
