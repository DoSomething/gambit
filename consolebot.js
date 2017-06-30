'use strict';

require('dotenv').config();

const readline = require('readline');
const superagent = require('superagent');
const colors = require('colors'); // eslint-disable-line no-unused-vars
const config = require('./config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function help() {
  console.log('Supported commands:');
  console.log('/help        : Show this text.');
  console.log('/quit        : Exit the program.');
}

console.log('Send a message to Slothie B\n');

rl.setPrompt('You> '.bold);
rl.prompt();

rl.on('line', (cmd) => {
  // Handle commands.
  if (cmd === '/help') {
    return help();
  } else if (cmd === '/quit') {
    return process.exit(0);
  }

  // Post to our local chatbot endpoint to chat.
  return superagent
    .post(`http://localhost:${config.port}/api/v1/chatbot`)
    .send({
      userId: 'localuser',
      text: cmd,
      platform: 'consolebot',
    })
    .then((res) => {
      const reply = res.body.reply.text;
      if (reply) {
        console.log('');
        console.log('Bot>'.bold.magenta, `${reply}`.yellow);
        console.log('');
      }

      return rl.prompt();
    })
    .catch((err) => {
      console.log(`error:${err.message}`);
      return rl.prompt();
    });
}).on('close', () => {
  console.log('');
  process.exit(0);
});
