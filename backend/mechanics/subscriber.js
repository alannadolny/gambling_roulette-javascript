const mqtt = require('mqtt');
const client = mqtt.connect('http://localhost:1883');
const _ = require('lodash');
const axios = require('axios');
const https = require('https');
let betsForRound = [];

client.on('connect', function () {
  client.subscribe('game/#', () => {
    client.on('message', (topic, message) => {
      if (topic === 'game/delete/bet') {
        betsForRound = betsForRound.filter(
          (el) =>
            el.username !== JSON.parse(message.toString()).username &&
            el.color !== JSON.parse(message.toString()).color
        );
      }
      if (topic === 'game/bet')
        betsForRound.push(JSON.parse(message.toString()));
      if (topic === 'game/result') {
        betsForRound = _.chain(betsForRound)
          .groupBy('username')
          .map((value, key) => {
            return {
              user: key,
              money: value
                .map((el) => {
                  if (
                    (el.color === 'black' &&
                      JSON.parse(message.toString()).color === 'black') ||
                    (el.color === 'red' &&
                      JSON.parse(message.toString()).color === 'red')
                  )
                    return parseInt(el.coins) * 2;
                  else {
                    if (
                      JSON.parse(message.toString()).color === 'green' &&
                      el.color === 'green'
                    )
                      return parseInt(el.coins) * 11;
                    else return 0;
                  }
                })
                .reduce((prev, curr) => {
                  return prev + curr;
                }, 0),
            };
          })
          .value();
        for (const person of betsForRound) {
          axios
            .get(`https://localhost:5000/users/${person.user}`, {
              httpsAgent: new https.Agent({
                rejectUnauthorized: false,
              }),
            })
            .then((value) => {
              axios.put(
                'https://localhost:5000/users/',
                {
                  username: person.user,
                  money: person.money + parseInt(value.data.money),
                },
                {
                  httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                  }),
                }
              );
            });
        }
        betsForRound = [];
      }
    });
  });
});
