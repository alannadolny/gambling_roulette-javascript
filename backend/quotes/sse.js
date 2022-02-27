const express = require('express');
const router = express.Router({ mergeParams: true });
const quotes = require('./quotes.json');

let currentQoutes = quotes.quotes[Math.floor(Math.random() * 5)].description;

setInterval(() => {
  currentQoutes = quotes.quotes[Math.floor(Math.random() * 5)].description;
}, 5000);

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const intervalId = setInterval(() => {
    res.write(`data: ${currentQoutes}\n\n`);
  }, 1000);

  res.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

module.exports = router;
