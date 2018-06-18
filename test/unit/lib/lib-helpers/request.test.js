'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const campaignFactory = require('../../../helpers/factories/campaign');
const conversationFactory = require('../../../helpers/factories/conversation');
const topicFactory = require('../../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const requestHelper = require('../../../../lib/helpers/request');

const sandbox = sinon.sandbox.create();

const campaignId = stubs.getCampaignId();
const userId = stubs.getUserId();
const platformUserId = stubs.getMobileNumber();
const conversation = conversationFactory.getValidConversation();
const macro = stubs.getRandomWord();
const message = conversation.lastOutboundMessage;
const topic = topicFactory.getValidTopic();

test.beforeEach((t) => {
  sandbox.stub(helpers.analytics, 'addCustomAttributes')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
});

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// changeTopic
test('changeTopic should call setTopic and return req.conversation.changeTopic', async (t) => {
  sandbox.stub(requestHelper, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(conversation, 'changeTopic')
    .returns(Promise.resolve(true));
  t.context.req.conversation = conversation;

  await requestHelper.changeTopic(t.context.req, topic);
  requestHelper.setTopic.should.have.been.calledWith(t.context.req, topic);
  conversation.changeTopic.should.have.been.calledWith(topic);
});

// changeTopicByCampaign
test('changeTopicByCampaign should call setCampaign and return error if campaign does not have topics', async (t) => {
  sandbox.stub(requestHelper, 'setCampaign')
    .returns(underscore.noop);
  sandbox.stub(conversation, 'changeTopic')
    .returns(Promise.resolve(true));
  t.context.req.conversation = conversation;
  const campaign = campaignFactory.getValidCampaignWithoutTopics();

  await t.throws(requestHelper.changeTopicByCampaign(t.context.req, campaign));
  requestHelper.setCampaign.should.have.been.calledWith(t.context.req, campaign);
  conversation.changeTopic.should.not.been.called;
});

test('changeTopicByCampaign should call setCampaign and return changeTopic if campaign has topics', async (t) => {
  sandbox.stub(requestHelper, 'setCampaign')
    .returns(underscore.noop);
  sandbox.stub(requestHelper, 'changeTopic')
    .returns(Promise.resolve(true));
  t.context.req.conversation = conversation;
  const campaign = campaignFactory.getValidCampaign();

  await requestHelper.changeTopicByCampaign(t.context.req, campaign);
  requestHelper.setCampaign.should.have.been.calledWith(t.context.req, campaign);
  requestHelper.changeTopic.should.have.been.calledWith(t.context.req, campaign.topics[0]);
});

// executeChangeTopicMacro
test('executeChangeTopicMacro should call setKeyword, fetch topic and return changeTopic', async (t) => {
  t.context.req.rivescriptMatch = stubs.getRandomWord();
  t.context.req.rivescriptReplyTopic = stubs.getContentfulId();
  t.context.req.macro = stubs.getRandomWord();
  sandbox.stub(requestHelper, 'setKeyword')
    .returns(underscore.noop);
  sandbox.stub(requestHelper, 'changeTopic')
    .returns(Promise.resolve(true));
  sandbox.stub(helpers.topic, 'fetchById')
    .returns(Promise.resolve(topic));
  t.context.req.conversation = conversation;

  await requestHelper.executeChangeTopicMacro(t.context.req);
  requestHelper.setKeyword.should.have.been
    .calledWith(t.context.req, t.context.req.rivescriptMatch);
  helpers.topic.fetchById.should.have.been.calledWith(t.context.req.rivescriptReplyTopic);
  requestHelper.changeTopic.should.have.been.calledWith(t.context.req, topic);
});

// hasCampaign
test('hasCampaign should return boolean of whether req.campign defined', (t) => {
  t.context.req.campaign = campaignFactory.getValidCampaign();
  t.truthy(requestHelper.hasCampaign(t.context.req));
  t.context.req.campaign = null;
  t.falsy(requestHelper.hasCampaign(t.context.req));
});

// isChangeTopicMacro
test('isChangeTopicMacro should return true if req.macro is changeTopic', (t) => {
  sandbox.stub(helpers.macro, 'isChangeTopic')
    .returns(true);
  t.context.req.macro = macro;
  t.truthy(requestHelper.isChangeTopicMacro(t.context.req));
});

test('isChangeTopicMacro should return false if req.macro is undefined', (t) => {
  sandbox.stub(helpers.macro, 'isChangeTopic')
    .returns(true);
  t.falsy(requestHelper.isChangeTopicMacro(t.context.req));
});

test('isChangeTopicMacro should return false if req.macro is not changeTopic', (t) => {
  sandbox.stub(helpers.macro, 'isChangeTopic')
    .returns(false);
  t.context.req.macro = macro;
  t.falsy(requestHelper.isChangeTopicMacro(t.context.req));
});

// isConfirmedTopicMacro
test('isConfirmedTopicMacro should return true if req.macro is confirmedTopic', (t) => {
  sandbox.stub(helpers.macro, 'isConfirmedTopic')
    .returns(true);
  t.context.req.macro = macro;
  t.truthy(requestHelper.isConfirmedTopicMacro(t.context.req));
});

test('isConfirmedTopicMacro should return false if req.macro is undefined', (t) => {
  sandbox.stub(helpers.macro, 'isConfirmedTopic')
    .returns(true);
  t.falsy(requestHelper.isConfirmedTopicMacro(t.context.req));
});

test('isConfirmedTopicMacro should return false if req.macro is not confirmedTopic', (t) => {
  sandbox.stub(helpers.macro, 'isConfirmedTopic')
    .returns(false);
  t.context.req.macro = macro;
  t.falsy(requestHelper.isConfirmedTopicMacro(t.context.req));
});

// isDeclinedTopicMacro
test('isDeclinedTopicMacro should return true if req.macro is declinedTopic', (t) => {
  sandbox.stub(helpers.macro, 'isDeclinedTopic')
    .returns(true);
  t.context.req.macro = macro;
  t.truthy(requestHelper.isDeclinedTopicMacro(t.context.req));
});

test('isDeclinedTopicMacro should return false if req.macro is undefined', (t) => {
  sandbox.stub(helpers.macro, 'isDeclinedTopic')
    .returns(true);
  t.falsy(requestHelper.isDeclinedTopicMacro(t.context.req));
});

test('isDeclinedTopicMacro should return false if req.macro is not declinedTopic', (t) => {
  sandbox.stub(helpers.macro, 'isDeclinedTopic')
    .returns(false);
  t.context.req.macro = macro;
  t.falsy(requestHelper.isDeclinedTopicMacro(t.context.req));
});

// isLastOutboundAskContinue
test('isLastOutboundAskContinue should return whether if req.lastOutboundTemplate is an askContinue template', (t) => {
  sandbox.stub(helpers.template, 'isAskContinueTemplate')
    .returns(true);
  t.context.req.lastOutboundTemplate = stubs.getRandomWord();
  t.truthy(requestHelper.isLastOutboundAskContinue(t.context.req));
  helpers.template.isAskContinueTemplate
    .should.have.been.calledWith(t.context.req.lastOutboundTemplate);
});

// isLastOutboundAskSignup
test('isLastOutboundAskSignup should return whether if req.lastOutboundTemplate is an askSignup template', (t) => {
  sandbox.stub(helpers.template, 'isAskSignupTemplate')
    .returns(true);
  t.context.req.lastOutboundTemplate = stubs.getRandomWord();
  t.truthy(requestHelper.isLastOutboundAskSignup(t.context.req));
  helpers.template.isAskSignupTemplate
    .should.have.been.calledWith(t.context.req.lastOutboundTemplate);
});

// isLastOutboundTopicTemplate
test('isLastOutboundTopicTemplate should return whether if req.lastOutboundTemplate is a gambitCampaigns template', (t) => {
  sandbox.stub(helpers.template, 'isGambitCampaignsTemplate')
    .returns(true);
  t.context.req.lastOutboundTemplate = stubs.getRandomWord();
  t.truthy(requestHelper.isLastOutboundTopicTemplate(t.context.req));
  helpers.template.isGambitCampaignsTemplate
    .should.have.been.calledWith(t.context.req.lastOutboundTemplate);
});

// isMenuMacro
test('isMenuMacro should return true if req.macro is menu', (t) => {
  sandbox.stub(helpers.macro, 'isMenu')
    .returns(true);
  t.context.req.macro = macro;
  t.truthy(requestHelper.isMenuMacro(t.context.req));
});

test('isMenuMacro should return false if req.macro is undefined', (t) => {
  sandbox.stub(helpers.macro, 'isMenu')
    .returns(true);
  t.falsy(requestHelper.isMenuMacro(t.context.req));
});

test('isMenuMacro should return false if req.macro is not menu', (t) => {
  sandbox.stub(helpers.macro, 'isMenu')
    .returns(false);
  t.context.req.macro = macro;
  t.falsy(requestHelper.isMenuMacro(t.context.req));
});

// parseCampaignKeyword
test('parseCampaignKeyword should return trimmed lowercase req.inboundMessageText', () => {
  const text = 'Winter ';
  const trimSpy = sandbox.spy(String.prototype, 'trim');
  const toLowerCaseSpy = sandbox.spy(String.prototype, 'toLowerCase');
  const result = requestHelper.parseCampaignKeyword({ inboundMessageText: text });

  trimSpy.should.have.been.called;
  toLowerCaseSpy.should.have.been.called;
  result.should.equal('winter');
});

test('parseCampaignKeyword should return null when req.inboundMessageText undefined', (t) => {
  const result = requestHelper.parseCampaignKeyword({});
  t.falsy(result);
});

// setCampaign
test('setCampaign should inject a campaign property to req and call setCampaignId if !req.campaignId', (t) => {
  sandbox.spy(requestHelper, 'setCampaignId');
  const campaign = campaignFactory.getValidCampaign();

  requestHelper.setCampaign(t.context.req, campaign);
  t.context.req.campaign.should.deep.equal(campaign);
  requestHelper.setCampaignId.should.have.been.calledWith(t.context.req, campaign.id);
});

test('setCampaign should not call setCampaignId if req.campaignId', (t) => {
  sandbox.spy(requestHelper, 'setCampaignId');
  const campaign = campaignFactory.getValidCampaign();
  t.context.req.campaignId = stubs.getCampaignId();

  requestHelper.setCampaign(t.context.req, campaign);
  t.context.req.campaign.should.deep.equal(campaign);
  requestHelper.setCampaignId.should.not.have.been.called;
});

// setCampaignId
test('setCampaignId should inject a campaignId property to req', (t) => {
  requestHelper.setCampaignId(t.context.req, campaignId);
  t.context.req.campaignId.should.equal(campaignId);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ campaignId });
});

// setConversation
test('setConversation should inject a conversation property to req', (t) => {
  sandbox.stub(requestHelper, 'setLastOutboundMessage')
    .returns(underscore.noop);
  requestHelper.setConversation(t.context.req, conversation);
  t.context.req.conversation.should.equal(conversation);
  const conversationId = conversation.id;
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ conversationId });
  requestHelper.setLastOutboundMessage.should.have.been.calledWith(t.context.req, message);
});

test('setConversation should not call setLastOutboundMessage does not exist', (t) => {
  const newConversation = conversationFactory.getValidConversation();
  newConversation.lastOutboundMessage = null;
  sandbox.stub(requestHelper, 'setLastOutboundMessage')
    .returns(underscore.noop);

  requestHelper.setConversation(t.context.req, newConversation);
  requestHelper.setLastOutboundMessage.should.not.have.been.called;
});

// setKeyword
test('setKeyword should inject a keyword to req', (t) => {
  const keyword = stubs.getRandomWord();
  requestHelper.setKeyword(t.context.req, keyword);
  t.context.req.keyword.should.equal(keyword);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ keyword });
});

test('setLastOutboundMessage should inject lastOutbound properties to req', (t) => {
  requestHelper.setLastOutboundMessage(t.context.req, message);
  t.context.req.lastOutboundTemplate.should.equal(message.template);
  t.context.req.lastOutboundBroadcastId.should.equal(message.broadcastId);
  helpers.analytics.addCustomAttributes.should.have.been.called;
});

test('setOutboundMessageTemplate should inject a outboundMessageTemplate property to req', (t) => {
  const outboundMessageTemplate = message.template;
  requestHelper.setOutboundMessageTemplate(t.context.req, outboundMessageTemplate);
  t.context.req.outboundMessageTemplate.should.equal(outboundMessageTemplate);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ outboundMessageTemplate });
});

test('setOutboundMessageText should inject a outboundMessageTextproperty to req', (t) => {
  const text = message.text;
  requestHelper.setOutboundMessageText(t.context.req, text);
  t.context.req.outboundMessageText.should.equal(text);
});

test('setPlatform should set req.platform to platform parameter', (t) => {
  const alexaPlatform = 'alexa';
  requestHelper.setPlatform(t.context.req, alexaPlatform);
  t.context.req.platform.should.equal(alexaPlatform);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ platform: alexaPlatform });
});

test('setPlatform should set req.platform to sms if platform parameter undefined ', (t) => {
  sandbox.spy(requestHelper, 'setPlatform');
  requestHelper.setPlatform(t.context.req);
  const smsPlatform = stubs.getPlatform();
  t.context.req.platform.should.equal(smsPlatform);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ platform: smsPlatform });
});

test('setPlatformUserId should inject a platformUserId property to req', (t) => {
  requestHelper.setPlatformUserId(t.context.req, platformUserId);
  t.context.req.platformUserId.should.equal(platformUserId);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ platformUserId });
});

// setTopic
test('setTopic should inject a topic property to req and call setCampaign if topic.campaign and req.campaign undefined', (t) => {
  sandbox.spy(requestHelper, 'setCampaign');
  requestHelper.setTopic(t.context.req, topic);
  t.context.req.topic.should.equal(topic);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ topic: topic.id });
  requestHelper.setCampaign.should.have.been.calledWith(t.context.req, topic.campaign);
});

test('setTopic should not call setCampaign if topic.campaign undefined', (t) => {
  sandbox.spy(requestHelper, 'setCampaign');
  const campaignlessTopic = topicFactory.getValidTopic();
  campaignlessTopic.campaign = null;
  requestHelper.setTopic(t.context.req, campaignlessTopic);
  t.context.req.topic.should.equal(campaignlessTopic);
  helpers.analytics.addCustomAttributes
    .should.have.been.calledWith({ topic: campaignlessTopic.id });
  requestHelper.setCampaign.should.not.have.been.called;
});

// setUserId
test('setUserId should inject a userId property to req', (t) => {
  requestHelper.setUserId(t.context.req, userId);
  t.context.req.userId.should.equal(userId);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ userId });
});
