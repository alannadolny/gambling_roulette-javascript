const express = require('express');
const router = express.Router({ mergeParams: true });
const driver = require('../config/neo4jDriver');
const CryptoJS = require('crypto-js');
const key = 'secret key 123';

router.get('/contains/:characters', async (req, res) => {
  const session = driver.session();
  let response = [];
  await session
    .run(
      `
      MATCH (n: User) WHERE n.username CONTAINS "${req.params.characters}" RETURN properties(n) as n
    `
    )
    .subscribe({
      onNext: (record) => {
        response.push(record.get('n'));
      },
      onCompleted: () => {
        res.send(response);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.get('/topBets', async (req, res) => {
  const session = driver.session();
  let response = [];
  await session
    .run(
      `
      MATCH (n:User) WITH n.username as username, n.money as money ORDER BY money DESC LIMIT 10 RETURN username, money
    `
    )
    .subscribe({
      onNext: (record) => {
        response.push({
          username: record.get('username'),
          money: record.get('money'),
        });
      },
      onCompleted: () => {
        res.send(response);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.get('/:username', async (req, res) => {
  const session = driver.session();
  let response = null;
  await session
    .run(
      `
    MATCH (u:User {username: "${req.params.username}"}) RETURN properties(u) as u
    `
    )
    .subscribe({
      onNext: (record) => {
        response = record.get('u');
      },
      onCompleted: () => {
        res.send(
          response && {
            ...response,
            password: CryptoJS.AES.decrypt(response.password, key).toString(
              CryptoJS.enc.Utf8
            ),
          }
        );
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.post('/', async (req, res) => {
  const session = driver.session();
  const mainSession = driver.session();
  const password = await CryptoJS.AES.encrypt(
    req.body.password,
    key
  ).toString();
  let duplicate = null;
  let response = null;
  await session
    .run(
      `
  MATCH (n: User {username: "${req.body.username}"}) RETURN properties(n) as u
  `
    )
    .subscribe({
      onNext: (record) => {
        duplicate = record.get('u');
      },
      onCompleted: async () => {
        if (duplicate) {
          res.send('USERNAME_IS_DUPLICATED');
          session.close();
        } else {
          await mainSession
            .run(
              `
                    CREATE (u:User {username: "${req.body.username}", password: "${password}", money: 0}) RETURN properties(u) as u
                    `
            )
            .subscribe({
              onNext: (record) => {
                response = record.get('u');
              },
              onCompleted: () => {
                res.send(response);
                session.close();
              },
              onError: (err) => {
                res.status(500).send(err);
              },
            });
        }
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.put('/', async (req, res) => {
  const session = driver.session();
  let response = null;
  await session
    .run(
      `
    MATCH (u:User {username: "${req.body.username}"}) SET u.money = ${req.body.money} RETURN properties(u) as u
    `
    )
    .subscribe({
      onNext: (record) => {
        response = record.get('u');
      },
      onCompleted: () => {
        res.send(response);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.put('/password', async (req, res) => {
  const session = driver.session();
  let response = null;
  const password = await CryptoJS.AES.encrypt(
    req.body.password,
    key
  ).toString();
  await session
    .run(
      `
    MATCH (u:User {username: "${req.body.username}"}) SET u.password = "${password}" RETURN properties(u) as u
    `
    )
    .subscribe({
      onNext: (record) => {
        response = record.get('u');
      },
      onCompleted: () => {
        res.send(response);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

router.delete('/:username', async (req, res) => {
  const session = driver.session();
  let response = null;
  await session
    .run(
      `
    MATCH (u: User {username: "${req.params.username}"}) WITH u, u.username as username, u.password as password DETACH DELETE u RETURN username, password
    `
    )
    .subscribe({
      onNext: (record) => {
        response = {
          username: record.get('username'),
          password: record.get('password'),
        };
      },
      onCompleted: () => {
        res.send(response);
        session.close();
      },
      onError: (err) => {
        res.status(500).send(err);
      },
    });
});

module.exports = router;
