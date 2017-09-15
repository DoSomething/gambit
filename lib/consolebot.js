'use strict';

const colors = require('colors'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const readline = require('readline');
const superagent = require('superagent');
const underscore = require('underscore');
const uuidv4 = require('uuid/v4');

const defaultConfig = require('../config/lib/consolebot');

const retryHeader = 'x-blink-retry-count';
const requestIdHeader = 'x-request-id';

function getPayload() {

}

class Consolebot {
  constructor(config = {}) {
    this.options = underscore.extend({}, defaultConfig, config);
    this.history = [];
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
    if (string === 'retry' && this.history.length) {
      const retryPayload = this.history.pop();
      retryPayload.headers[retryHeader] += 1;
      return retryPayload;
    }
    return {
      text: string,
    };
  }
  post(data) {
    let payload;

    if (data.headers && data.headers[retryHeader]) {
      payload = data;
    } else {
      const defaultPayload = {
        platformUserId: this.options.platformUserId,
        text: '',
        headers: {},
      };
      defaultPayload.headers[retryHeader] = 0;
      defaultPayload.headers[requestIdHeader] = uuidv4();

      payload = underscore.extend({}, defaultPayload, data);
    }

    this.history.push(payload);
    return superagent
      .post(this.options.url)
      .set(retryHeader, payload.headers[retryHeader])
      .set(requestIdHeader, payload.headers[requestIdHeader])
      .send(payload)
      .then(res => this.handleSuccess(res))
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
  handleSuccess(res) {
    const data = res.body.data;
    if (data.outbound) {
      return this.reply(data.outbound[0].text);
    }

    return this.reply('');
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
