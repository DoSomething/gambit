'use strict';

const Consolebot = require('./lib/consolebot');

try {
  const bot = new Consolebot();
  bot.start();
} catch (err) {
  Consolebot.print('Epic fail:', err.message);
  process.exit(0);
}
