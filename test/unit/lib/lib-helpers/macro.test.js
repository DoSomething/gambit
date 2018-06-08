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
const changeTopicMacroName = `${config.changeTopicPrefix}${topicId}`;
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

// getTopicIdFromChangeTopicMacro
test('getTopicIdFromChangeTopicMacro returns topicId from given changeTopic macro name', () => {
  const result = macroHelper.getTopicIdFromChangeTopicMacro(changeTopicMacroName);
  result.should.equal(topicId);
});

// isChangeTopic
test('isChangeTopic returns whether string includes changeTopic macro prefix', (t) => {
  t.truthy(macroHelper.isChangeTopic(changeTopicMacroName));
  t.falsy(macroHelper.isChangeTopic(undefinedMacroName));
});

// isMacro
test('isMacro returns true if macro isChangeTopic', (t) => {
  sandbox.stub(macroHelper, 'isChangeTopic')
    .returns(true);
  t.truthy(macroHelper.isMacro());
});

test('isMacro returns whether text exists for given macro if not isChangeTopic', (t) => {
  sandbox.stub(macroHelper, 'isChangeTopic')
    .returns(false);
  const macro = config.macros.subscriptionStatusStop;
  t.truthy(macroHelper.isMacro(macro));
});

test('isMacro should return falsy for undefined macro', (t) => {
  t.falsy(macroHelper.isMacro(undefinedMacroName));
});

// isCampaignMenu
test('isCampaignMenu should return boolean', (t) => {
  t.true(macroHelper.isCampaignMenu(macros.campaignMenu));
  t.falsy(macroHelper.isCampaignMenu(undefinedMacroName));
});

test('macro.macros.x() should be equal to macro.macroNameValues.x', () => {
  Object.keys(config.macros).forEach((macroName) => {
    macroHelper.macros[macroName]().should.be.equal(macroName);
  });
});

test('isConfirmedTopic should return boolean', (t) => {
  t.true(macroHelper.isConfirmedTopic(macros.confirmedTopic));
  t.falsy(macroHelper.isConfirmedTopic(undefinedMacroName));
});

test('isDeclinedTopic should return boolean', (t) => {
  t.true(macroHelper.isDeclinedTopic(macros.declinedTopic));
  t.falsy(macroHelper.isDeclinedTopic(undefinedMacroName));
});

test('isSendCrisisMessage should return boolean', (t) => {
  t.true(macroHelper.isSendCrisisMessage(macros.sendCrisisMessage));
  t.falsy(macroHelper.isSendCrisisMessage(undefinedMacroName));
});

test('isSendInfoMessage should return boolean', (t) => {
  t.true(macroHelper.isSendInfoMessage(macros.sendInfoMessage));
  t.falsy(macroHelper.isSendInfoMessage(undefinedMacroName));
});

test('isSubscriptionStatusLess should return boolean', (t) => {
  t.true(macroHelper.isSubscriptionStatusLess(macros.subscriptionStatusLess));
  t.falsy(macroHelper.isSubscriptionStatusLess(undefinedMacroName));
});

test('isSubscriptionStatusStop should return boolean', (t) => {
  t.true(macroHelper.isSubscriptionStatusStop(macros.subscriptionStatusStop));
  t.falsy(macroHelper.isSubscriptionStatusStop(undefinedMacroName));
});

test('isSupportRequested should return boolean', (t) => {
  t.true(macroHelper.isSupportRequested(macros.supportRequested));
  t.falsy(macroHelper.isSupportRequested(undefinedMacroName));
});
