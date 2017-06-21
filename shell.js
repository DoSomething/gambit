'use strict';

require('dotenv').config();

const readline = require('readline');
const superagent = require('superagent');
const config = require('./config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Send a message to Slothie B\n');

rl.setPrompt('You> ');
rl.prompt();
rl.on('line', (cmd) => {
  // Handle commands.
  if (cmd === '/help') {
    help();
  } else if (cmd === '/quit') {
    process.exit(0);
  } else {
    return superagent
      .post(`http://localhost:${config.port}/v1/chatbot`)
      .send({
        userId: 'localuser',
        message: cmd,
      })
      .then(response => console.log('Bot>', response.body.response.message))
      .catch(err => console.log(`error:${err.message}`));
  }
  
  rl.prompt();
}).on('close', () => {
  console.log('');
  process.exit(0);
});

function help() {
  console.log('Supported commands:');
  console.log('/help        : Show this text.');
  console.log('/quit        : Exit the program.');
}
