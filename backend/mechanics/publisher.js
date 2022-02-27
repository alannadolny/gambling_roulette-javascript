const mqtt = require('mqtt');
const client = mqtt.connect('http://localhost:1883');
const uuid = require('uuid');

let timer = 41;
let roundHash = uuid.v4();

const getNumberAndColor = () => {
  const number = Math.floor(Math.random() * 14);
  let color;
  if (number === 0) color = 'green';
  if (number <= 7 && number !== 0) color = 'red';
  if (number > 7) color = 'black';
  return {
    number,
    color,
  };
};

client.on('connect', function () {
  setInterval(() => {
    client.publish('game/roundHash', roundHash.toString());
    if (timer === 12) {
      client.publish('game/result', JSON.stringify(getNumberAndColor()));
    }
    if (timer <= 11) {
      client.publish('game/timer', 'losowanie...');
      timer--;
      if (timer === 0) {
        timer = 41;
        roundHash = uuid.v4();
      }
    } else {
      client.publish('game/timer', (timer - 11).toString());
      timer--;
    }
  }, 1000);
});
