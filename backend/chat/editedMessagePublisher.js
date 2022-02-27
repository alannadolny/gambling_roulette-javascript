const mqtt = require('mqtt');
const client = mqtt.connect('http://localhost:1883');
const axios = require('axios');
const https = require('https');

client.on('connect', () => {
  client.subscribe('message/edited', () => {
    client.on('message', (topic, message) => {
      axios
        .put(
          `https://localhost:5000/chats/${JSON.parse(message.toString()).id}`,
          {
            message: JSON.parse(message.toString()).message,
          },
          {
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          }
        )
        .then((value) => {
          client.publish(
            'message/edited/signal',
            JSON.stringify(value.data).toString()
          );
        });
    });
  });
});
