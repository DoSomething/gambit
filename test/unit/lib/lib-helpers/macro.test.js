'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// app modules
const config = require('../../../../config/lib/helpers/macro');
const stubs = require('../../../helpers/stubs');

const macros = config.macros;
const topicId = stubs.getTopicId();
const changeTopicMacroName = `${config.macros.changeTopic}{topic=${topicId}}`;
const undefinedMacroName = 'trialByCombat';

// module to be tested
const macroHelper = require('../../../../lib/helpers/macro');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// getReply
test('getReply should return text for given macro', () => {
  const macro = config.macros.subscriptionStatusStop;
  const reply = config.replies[macro];
  const result = macroHelper.getReply(macro);
  reply.should.equal(result);
});

test('getReply should return falsy for undefined macro reply', (t) => {
  t.falsy(macroHelper.getReply(undefinedMacroName));
});

// getChangeTopicMacroFromTopicId
test('getChangeTopicMacroFromTopicId returns string with changeTopicMacro prefix and topicId', () => {
  const result = macroHelper.getChangeTopicMacroFromTopicId(topicId);
  result.should.equal(changeTopicMacroName);
});

// isChangeTopic
test('isChangeTopic should return boolean', (t) => {
  t.true(macroHelper.isChangeTopic(macros.changeTopic));
  t.falsy(macroHelper.isChangeTopic(undefinedMacroName));
});

// isMacro
test('isMacro returns whether text exists for given macro', (t) => {
  const macro = config.macros.subscriptionStatusStop;
  t.truthy(macroHelper.isMacro(macro));
  t.falsy(macroHelper.isMacro(undefinedMacroName));
});

test('macro.macros.x() should be equal to macro.macroNameValues.x', () => {
  Object.keys(config.macros).forEach((macroName) => {
    macroHelper.macros[macroName]().should.be.equal(macroName);
  });
});

test('isSaidYes should return boolean', (t) => {
  t.true(macroHelper.isSaidYes(macros.saidYes));
  t.falsy(macroHelper.isSaidYes(undefinedMacroName));
});

test('isSaidNo should return boolean', (t) => {
  t.true(macroHelper.isSaidNo(macros.saidNo));
  t.falsy(macroHelper.isSaidNo(undefinedMacroName));
});

test('isSendCrisisMessage should return boolean', (t) => {
  t.true(macroHelper.isSendCrisisMessage(macros.sendCrisisMessage));
  t.falsy(macroHelper.isSendCrisisMessage(undefinedMacroName));
});

test('isSendInfoMessage should return boolean', (t) => {
  t.true(macroHelper.isSendInfoMessage(macros.sendInfoMessage));
  t.falsy(macroHelper.isSendInfoMessage(undefinedMacroName));
});

test('isSupportRequested should return boolean', (t) => {
  t.true(macroHelper.isSupportRequested(macros.supportRequested));
  t.falsy(macroHelper.isSupportRequested(undefinedMacroName));
});
