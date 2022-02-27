const axios = require('axios');
const https = require('https');
const mqtt = require('mqtt');
const client = mqtt.connect('http://localhost:1883');

const tooManyMessages = (channel, messages) => {
  if (messages.length > 10) {
    axios
      .delete(`https://localhost:5000/chats/${channel}`, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      })
      .then((value) => {
        if (value.data === 'OK') {
          client.publish('message/edited/signal', value.data);
        }
      });
  }
};

setInterval(() => {
  axios
    .get(`https://localhost:5000/chats/PL`, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    .then((value) => {
      tooManyMessages('PL', value.data);
    });
  axios
    .get(`https://localhost:5000/chats/US`, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    .then((value) => {
      tooManyMessages('US', value.data);
    });
  axios
    .get(`https://localhost:5000/chats/DE`, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    .then((value) => {
      tooManyMessages('DE', value.data);
    });
}, 1000);
