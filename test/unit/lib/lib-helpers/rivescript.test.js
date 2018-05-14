'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');

// module to be tested
const rivescriptHelper = require('../../../../lib/helpers/rivescript');

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// formatRivescriptCommand
test('formatRivescriptCommand should return a trimmed, concatted string', () => {
  const command = config.commands.trigger;
  const word = stubs.getRandomWord();

  const result = rivescriptHelper.formatRivescriptCommand(command, `${word}   `);
  result.should.equal(`${command} ${word}`);
});

// formatTextAsRivescriptRedirect
test('formatTextAsRivescriptRedirect should return formatRivescriptCommand with redirect command and text', () => {
  const command = config.commands.redirect;
  const word = stubs.getRandomWord();
  const mockResult = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'formatRivescriptCommand')
    .returns(mockResult);

  const result = rivescriptHelper.formatTextAsRivescriptRedirect(word);
  rivescriptHelper.formatRivescriptCommand.should.have.been.calledWith(command, word);
  result.should.equal(mockResult);
});

// formatTextAsRivescriptReply
test('formatTextAsRivescriptReply should return formatRivescriptCommand with response command and text', () => {
  const command = config.commands.response;
  const word = stubs.getRandomWord();
  const mockResult = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'formatRivescriptCommand')
    .returns(mockResult);

  const result = rivescriptHelper.formatTextAsRivescriptReply(word);
  rivescriptHelper.formatRivescriptCommand.should.have.been.calledWith(command, word);
  result.should.equal(mockResult);
});

// formatTextAsRivescriptTrigger
test('formatTextAsRivescriptTrigger should return formatRivescriptCommand with response command and text', () => {
  const command = config.commands.trigger;
  const word = stubs.getRandomWord();
  const mockResult = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'formatRivescriptCommand')
    .returns(mockResult);

  const result = rivescriptHelper.formatTextAsRivescriptTrigger(word);
  rivescriptHelper.formatRivescriptCommand.should.have.been.calledWith(command, word);
  result.should.equal(mockResult);
});
