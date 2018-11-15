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
const config = require('../../../../config/lib/helpers/template');
const macroConfig = require('../../../../config/lib/helpers/macro');

const undefinedTemplateName = 'oathKeeper';

// module to be tested
const templateHelper = require('../../../../lib/helpers/template');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// getSubscriptionStatusActive
test('getSubscriptionStatusActive should return subscriptionStatusActive config object', () => {
  const result = templateHelper.getSubscriptionStatusActive();
  result.should.deep.equal(macroConfig.macros.subscriptionStatusActive);
});

// isAskContinueTemplate
test('isAskContinueTemplate should return boolean', (t) => {
  t.true(templateHelper.isAskContinueTemplate('askContinue'));
  t.falsy(templateHelper.isAskContinueTemplate(undefinedTemplateName));
});

// isTopicTemplate
test('isTopicTemplate should return boolean', (t) => {
  const topicTemplates = config.templatesMap.topicTemplates;
  Object.keys(topicTemplates).forEach((templateName) => {
    t.true(templateHelper.isTopicTemplate(templateName));
  });
  t.falsy(templateHelper.isTopicTemplate(undefinedTemplateName));
});
