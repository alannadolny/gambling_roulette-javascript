const mqtt = require('mqtt');
const client = mqtt.connect('http://localhost:1883');
const axios = require('axios');
const https = require('https');

let resultToDatabase = {
  gameId: null,
  result: null,
};

client.on('connect', function () {
  client.subscribe('game/#', () => {
    client.on('message', (topic, message) => {
      if (topic === 'game/roundHash') {
        if (message.toString() !== resultToDatabase.gameId)
          resultToDatabase = {
            ...resultToDatabase,
            gameId: message.toString(),
          };
      }
      if (topic === 'game/result') {
        resultToDatabase = {
          ...resultToDatabase,
          result: message.toString(),
        };
        setTimeout(() => {
          axios.post(
            'https://localhost:5000/game/result/',
            {
              gameId: resultToDatabase.gameId,
              color: JSON.parse(resultToDatabase.result).color,
              number: JSON.parse(resultToDatabase.result).number,
            },
            {
              httpsAgent: new https.Agent({
                rejectUnauthorized: false,
              }),
            }
          );
        }, 15000);
      }
    });
  });
});
