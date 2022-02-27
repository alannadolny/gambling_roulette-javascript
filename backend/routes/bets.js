const express = require('express');
const router = express.Router({ mergeParams: true });
const driver = require('../config/neo4jDriver');

router.post('/:login/game/:gameId', async (req, res) => {
  const session = driver.session();
  const mainSession = driver.session();
  let bet;
  let result;
  await session
    .run(
      `
    MATCH (p: User {username: "${req.params.login}"})-[:BETS {round: "${req.params.gameId}"}]->(b {color: "${req.body.color}"}) RETURN properties(b) as b
    `
    )
    .subscribe({
      onNext: (record) => {
        bet = record.get('b');
      },
      onCompleted: async () => {
        session.close();
        await mainSession
          .run(
            !bet
              ? `
            MATCH (p: User {username: "${req.params.login}"}) CREATE (n: Bet {color: "${req.body.color}", value: ${req.body.value}})<-[:BETS {round: "${req.params.gameId}"}]-(p) RETURN properties(n) as n
            `
              : `MATCH (p:User {username: "${req.params.login}"})-[:BETS {round: "${req.params.gameId}"}]->(b:Bet {color: "${req.body.color}"}) SET b.value = b.value + ${req.body.value} RETURN properties(b) as n`
          )
          .subscribe({
            onNext: (record) => {
              result = record.get('n');
            },
            onCompleted: () => {
              res.send(result);
              mainSession.close();
            },
            onError: (err) => {
              res.status(500).send(err);
            },
          });
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.get('/:gameId', async (req, res) => {
  let bets = [];
  const session = driver.session();
  await session
    .run(
      `
  MATCH (n:User)-[:BETS {round: "${req.params.gameId}"}]->(u:Bet) RETURN n.username as n, properties(u) as u
    `
    )
    .subscribe({
      onNext: (record) => {
        bets.push({
          user: record.get('n'),
          bet: record.get('u'),
        });
      },
      onCompleted: () => {
        res.send(bets);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.put('/:login/game/:gameId', async (req, res) => {
  let bet;
  const session = driver.session();
  await session
    .run(
      `
    MATCH (u:User{username: "${req.params.login}"})-[:BETS{round: "${req.params.gameId}"}]->(b:Bet{color: "${req.body.color}"}) SET b.value = ${req.body.value} RETURN properties(b) as b
    `
    )
    .subscribe({
      onNext: (record) => {
        bet = record.get('b');
      },
      onCompleted: () => {
        res.send(bet);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.delete('/:login/game/:gameId/:color', async (req, res) => {
  const session = driver.session();
  await session
    .run(
      `
    MATCH (u:User{username: "${req.params.login}"})-[:BETS{round: "${req.params.gameId}"}]->(b:Bet {color: "${req.params.color}"}) DETACH DELETE b
    `
    )
    .subscribe({
      onCompleted: () => {
        res.send({
          deletedBet: {
            color: req.params.color,
            username: req.params.login,
            gameId: req.params.gameId,
          },
        });
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

module.exports = router;
