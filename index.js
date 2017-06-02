'use strict';

require('dotenv').config();

const readline = require('readline');
const fs = require('fs');
const RiveScript = require('rivescript');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let bot = null;
function loadBot() {
  bot = new RiveScript({
    debug:   process.env.DEBUG,
    concat:  'newline',
  });
  bot.ready = false;
  bot.loadDirectory('brain', loadingDone, loadingError);
}
loadBot();

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
    // Get a reply from the bot.
    const reply = (bot && bot.ready)
      ? bot.reply('localuser', cmd)
      : 'ERR: Bot Not Ready Yet';
    console.log('Bot>', reply);
  }
  
  rl.prompt();
}).on('close', () => {
  console.log('');
  process.exit(0);
});


function loadingDone(batchNumber) {
  bot.sortReplies();
  bot.ready = true;
}

function loadingError(error, batchNumber) {
  console.error('Loading error: ' + error);
}

function help() {
  console.log('Supported commands:');
  console.log('/help        : Show this text.');
  console.log('/eval <code> : Evaluate JavaScript code.');
  console.log('/log <code>  : Shortcut to /eval console.log(code).');
  console.log('/quit        : Exit the program.');
}
