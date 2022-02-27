const mqtt = require('mqtt');
const client = mqtt.connect('http://localhost:1883');

client.on('connect', function () {
  client.subscribe('game/history/refresh', () => {
    client.on('message', (topic, message) => {
      client.publish('game/history/refresh/new', 'refresh');
    });
  });
});
