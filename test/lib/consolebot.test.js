'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nock = require('nock');
const readline = require('readline');

const config = require('../../config/lib/consolebot');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const Consolebot = require('../../lib/consolebot');

// Setup
const defaultMaxListeners = process.stdin.getMaxListeners();

test.beforeEach(() => {
  sandbox.spy(Consolebot, 'print');
  // Each test usually adds a console bot instance, aka another listener.
  // Bump this to avoid MaxListenersExceededWarning.
  process.stdin.setMaxListeners(defaultMaxListeners + 1);
});

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  process.stdin.setMaxListeners(defaultMaxListeners);
});

// Tests
test('consolebot should respond to post', () => {
  const consolebot = new Consolebot(config);
  consolebot.should.respondTo('post');
});

test('consolebot should respond to prompt', () => {
  const consolebot = new Consolebot(config);
  consolebot.should.respondTo('prompt');
});

test('consolebot should respond to start', () => {
  const consolebot = new Consolebot(config);
  consolebot.should.respondTo('start');
});

test('consolebot should respond to reply', () => {
  const consolebot = new Consolebot(config);
  consolebot.should.respondTo('reply');
});

test('constructor should call readline.createInterface', () => {
  sandbox.spy(readline, 'createInterface');
  const consolebot = new Consolebot(config); // eslint-disable-line no-unused-vars
  readline.createInterface.should.have.been.called;
});

test('reply should call print', () => {
  const consolebot = new Consolebot(config);
  consolebot.reply('Hi again!');
  Consolebot.print.should.have.been.called;
});

test('reply should call prompt', () => {
  const consolebot = new Consolebot(config);
  sandbox.spy(consolebot, 'prompt');
  consolebot.reply('what up');
  consolebot.prompt.should.have.been.called;
});

test('start should call readline.createInterface', () => {
  const consolebot = new Consolebot(config);
  sandbox.spy(readline, 'createInterface');
  consolebot.start();
  readline.createInterface.should.have.been.called;
});

test('post should call reply on success', async () => {
  const consolebot = new Consolebot(config);
  sandbox.spy(consolebot, 'reply');

  const text = 'hello!';
  nock(config.request.url)
    .post('', {})
    .query(true)
    .reply(200, {
      reply: {
        text: 'Howdy.',
      },
    });

  // test
  await consolebot.post(text);
  consolebot.reply.should.have.been.called;
});

test('consolebot post should call reply on error', async () => {
  const consolebot = new Consolebot(config);
  sandbox.spy(consolebot, 'reply');

  const text = 'hi!';
  nock(config.request.url)
    .post('', {})
    .query(true)
    .reply(500, {
      reply: {
        text: 'Epic Fail :<',
      },
    });

  await consolebot.post(text);
  consolebot.reply.should.have.been.called;
});
