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
const config = require('../../../config/lib/helpers/macro');

const macros = config.macros;
const undefinedMacroName = 'trialByCombat';

// module to be tested
const macroHelper = require('../../../lib/helpers/macro');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('isMacro should return text for given macro', () => {
  const macro = config.macros.confirmedCampaign;
  const result = macroHelper.isMacro(macro);
  macro.should.equal(result);
});

test('isMacro should return falsy for undefined macro', (t) => {
  t.falsy(macroHelper.isMacro(undefinedMacroName));
});

test('isCampaignMenu should return boolean', (t) => {
  t.true(macroHelper.isCampaignMenu(macros.campaignMenu));
  t.falsy(macroHelper.isCampaignMenu(undefinedMacroName));
});

test('macro.macros.x() should be equal to macro.macroNameValues.x', () => {
  Object.keys(config.macros).forEach((macroName) => {
    macroHelper.macros[macroName]().should.be.equal(macroName);
  });
});

test('isConfirmedCampaign should return boolean', (t) => {
  t.true(macroHelper.isConfirmedCampaign(macros.confirmedCampaign));
  t.falsy(macroHelper.isConfirmedCampaign(undefinedMacroName));
});

test('isDeclinedCampaign should return boolean', (t) => {
  t.true(macroHelper.isDeclinedCampaign(macros.declinedCampaign));
  t.falsy(macroHelper.isDeclinedCampaign(undefinedMacroName));
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
