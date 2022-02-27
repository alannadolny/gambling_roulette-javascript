const express = require('express');
const router = express.Router({ mergeParams: true });
const driver = require('../config/neo4jDriver');

router.get('/:channel', async (req, res) => {
  const session = driver.session();
  let result = [];
  await session
    .run(
      `
      MATCH (n:Chat {channel: "${req.params.channel}"}) RETURN properties(n) as n, id(n) as id
    `
    )
    .subscribe({
      onNext: (record) => {
        result.push({ ...record.get('n'), id: record.get('id') });
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
  const session = driver.session();
  let result;
  await session
    .run(
      `
    CREATE (n: Chat {message: "${req.body.message}", from: "${req.body.username}", channel: "${req.body.channel}"}) RETURN properties(n) as n, id(n) as id
    `
    )
    .subscribe({
      onNext: (record) => {
        result = { ...record.get('n'), id: record.get('id') };
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

router.put('/:id', async (req, res) => {
  const session = driver.session();
  let result;
  await session
    .run(
      `
        MATCH (n: Chat) WHERE id(n) = ${req.params.id} SET n.message = "${req.body.message}" RETURN properties(n) as n
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

router.delete('/:channel', async (req, res) => {
  const session = driver.session();
  await session
    .run(
      `
      MATCH (n: Chat {channel: "${req.params.channel}"}) WITH n ORDER BY id(n) ASC LIMIT 1 DETACH DELETE n
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
