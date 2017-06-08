'use strict';

require('dotenv').config();

const readline = require('readline');
const bot = require('./lib/rivescript');

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
  } else if (cmd.indexOf('/data') === 0) {
    console.log(bot.getUservars('localuser'));
  } else if (cmd.indexOf('/eval ') === 0) {
    console.log(eval(cmd.replace('/eval ', '')));
  } else if (cmd.indexOf('/log ') === 0) {
    console.log(eval(cmd.replace('/log ', '')));
  } else if (cmd === '/quit') {
    process.exit(0);
  } else {
    const reply = bot.getReplyForUserMessage('localuser', cmd);
    console.log('Bot>', reply);
  }
  
  rl.prompt();
}).on('close', () => {
  console.log('');
  process.exit(0);
});

function help() {
  console.log('Supported commands:');
  console.log('/help        : Show this text.');
  console.log('/eval <code> : Evaluate JavaScript code.');
  console.log('/log <code>  : Shortcut to /eval console.log(code).');
  console.log('/quit        : Exit the program.');
}
