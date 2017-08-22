'use strict';

const colors = require('colors'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const readline = require('readline');
const superagent = require('superagent');
const underscore = require('underscore');

const defaultConfig = require('../config/lib/consolebot');

class Consolebot {
  constructor(config = {}) {
    this.options = underscore.extend({}, defaultConfig, config);
    this.replyColor = this.options.replyColor;
    this.readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.readline.setPrompt(`${this.options.prompt} `.bold);
    this.readline.on('line', input => this.post(this.parseInput(input)));
    this.readline.on('close', () => process.exit(0));
  }
  parseInput(string) {
    if (string === 'photo') {
      return {
        mediaUrl: this.options.photoUrl,
      };
    }
    return {
      text: string,
    };
  }
  post(data) {
    const defaultPayload = {
      userId: this.options.userId,
      text: '',
    };
    const payload = underscore.extend({}, defaultPayload, data);
    return superagent
      .post(this.options.url)
      .send(payload)
      .then(response => this.reply(response.body.reply.text))
      .catch(err => this.reply(err.message));
  }
  prompt() {
    this.readline.prompt();
  }
  start() {
    const lineReader = readline.createInterface({
      input: fs.createReadStream(this.options.introFilePath),
    });
    lineReader
      .on('line', line => console.log(line[this.replyColor])) // eslint-disable-line no-console
      .on('close', () => this.prompt());
  }
  reply(outboundMessageText) {
    const prefix = this.options.replyPrefix.bold[this.replyColor];
    const replyText = outboundMessageText[this.replyColor];
    Consolebot.print(prefix, replyText);
    this.prompt();
  }
  static print(prefix, messageText) {
    /* eslint-disable no-console */
    console.log('');
    console.log(prefix, messageText);
    console.log('');
    /* eslint-enable no-console */
  }
}

module.exports = Consolebot;
