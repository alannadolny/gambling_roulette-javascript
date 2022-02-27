const express = require('express');
const router = express.Router({ mergeParams: true });
const driver = require('../config/neo4jDriver');

router.get('/', async (req, res) => {
  let result = [];
  const session = driver.session();
  await session
    .run(
      `
      MATCH (n: Game) RETURN properties(n) as n
    `
    )
    .subscribe({
      onNext: (record) => {
        result.push(record.get('n'));
      },
      onCompleted: () => {
        res.send(result);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.post('/', async (req, res) => {
  let result;
  const session = driver.session();
  await session
    .run(
      `
    CREATE (n: Game {gameId: "${req.body.gameId}", color: "${req.body.color}", number: "${req.body.number}"}) RETURN properties(n) as n
    `
    )
    .subscribe({
      onNext: (record) => {
        result = record.get('n');
      },
      onCompleted: () => {
        res.send(result);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.put('/:gameId', async (req, res) => {
  let result;
  const session = driver.session();
  await session
    .run(
      `
      MATCH(n: Game{gameId: "${req.params.gameId}"}) SET n.color = "${req.body.color}" SET n.number = "${req.body.number}" RETURN properties(n) as n
    `
    )
    .subscribe({
      onNext: (record) => {
        result = record.get('n');
      },
      onCompleted: () => {
        res.send(result);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.delete('/', async (req, res) => {
  const session = driver.session();
  await session
    .run(
      `
      MATCH (n: Game) DETACH DELETE n
    `
    )
    .subscribe({
      onCompleted: () => {
        res.send('OK');
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

module.exports = router;
