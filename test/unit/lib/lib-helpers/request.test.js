'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');
const logger = require('../../../../lib/logger');
const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const stubs = require('../../../helpers/stubs');
const broadcastFactory = require('../../../helpers/factories/broadcast');
const campaignFactory = require('../../../helpers/factories/campaign');
const conversationFactory = require('../../../helpers/factories/conversation');
const topicFactory = require('../../../helpers/factories/topic');

const config = require('../../../../config/lib/helpers/request');

chai.should();
chai.use(sinonChai);

// module to be tested
const requestHelper = require('../../../../lib/helpers/request');

const sandbox = sinon.sandbox.create();

const campaignId = stubs.getCampaignId();
const userId = stubs.getUserId();
const platformUserId = stubs.getMobileNumber();
const conversation = conversationFactory.getValidConversation();
const macro = stubs.getMacro();
const message = conversation.lastOutboundMessage;
const topic = topicFactory.getValidTopic();

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(helpers.analytics, 'addCustomAttributes')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
});

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// changeTopic
test('changeTopic does not call setTopic if not a topic change', async (t) => {
  sandbox.stub(requestHelper, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(conversation, 'setTopic')
    .returns(Promise.resolve(true));
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = topic.id;

  await requestHelper.changeTopic(t.context.req, topic);
  requestHelper.setTopic.should.have.been.calledWith(t.context.req, topic);
  conversation.setTopic.should.not.have.been.called;
});

test('changeTopic calls helpers.user.setPendingSubscriptionStatusForUserId and setTopic when topic change is askSubscriptionStatus', async (t) => {
  sandbox.stub(requestHelper, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers.topic, 'isAskSubscriptionStatus')
    .returns(true);
  sandbox.stub(conversation, 'setTopic')
    .returns(Promise.resolve());
  sandbox.stub(helpers.user, 'setPendingSubscriptionStatusForUserId')
    .returns(Promise.resolve(true));
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = 'abc';
  t.context.req.userId = 'def';

  await requestHelper.changeTopic(t.context.req, topic);
  requestHelper.setTopic.should.have.been.calledWith(t.context.req, topic);
  helpers.user.setPendingSubscriptionStatusForUserId
    .should.have.been.calledWith(t.context.req.userId);
  conversation.setTopic.should.have.been.calledWith(topic);
});

test('changeTopic calls setTopic when topic change is not askSubscriptionStatus', async (t) => {
  sandbox.stub(requestHelper, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers.topic, 'isAskSubscriptionStatus')
    .returns(false);
  sandbox.stub(conversation, 'setTopic')
    .returns(Promise.resolve());
  sandbox.stub(helpers.user, 'setPendingSubscriptionStatusForUserId')
    .returns(Promise.resolve(true));
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = 'abc';
  t.context.req.userId = 'def';

  await requestHelper.changeTopic(t.context.req, topic);
  requestHelper.setTopic.should.have.been.calledWith(t.context.req, topic);
  helpers.user.setPendingSubscriptionStatusForUserId.should.not.have.been.called;
  conversation.setTopic.should.have.been.calledWith(topic);
});

test('changeTopic does not call setTopic when topic change is askSubscriptionStatus and setPendingSubscriptionStatusForUserId fails', async (t) => {
  sandbox.stub(requestHelper, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers.topic, 'isAskSubscriptionStatus')
    .returns(true);
  sandbox.stub(conversation, 'setTopic')
    .returns(Promise.resolve());
  const error = { message: 'Epic fail' };
  sandbox.stub(helpers.user, 'setPendingSubscriptionStatusForUserId')
    .returns(Promise.reject(error));
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = 'abc';
  t.context.req.userId = 'def';

  await t.throws(requestHelper.changeTopic(t.context.req, topic));
  requestHelper.setTopic.should.have.been.calledWith(t.context.req, topic);
  helpers.user.setPendingSubscriptionStatusForUserId.should.have.been.called;
  conversation.setTopic.should.not.have.been.called;
});


// changeTopicByCampaign
test('changeTopicByCampaign should call setCampaign and return error if campaign does not have topics', async (t) => {
  sandbox.stub(requestHelper, 'setCampaign')
    .returns(underscore.noop);
  sandbox.stub(conversation, 'setTopic')
    .returns(Promise.resolve(true));
  t.context.req.conversation = conversation;
  const campaign = campaignFactory.getValidCampaignWithoutTopics();

  await t.throws(requestHelper.changeTopicByCampaign(t.context.req, campaign));
  requestHelper.setCampaign.should.have.been.calledWith(t.context.req, campaign);
  conversation.setTopic.should.not.been.called;
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
  t.context.req.rivescriptReplyTopic = { id: stubs.getContentfulId() };
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
  helpers.topic.fetchById.should.have.been.calledWith(t.context.req.rivescriptReplyTopic.id);
  requestHelper.changeTopic.should.have.been.calledWith(t.context.req, topic);
});

// executeSaidNoMacro
test('executeSaidNoMacro should change to saidNo topic and send saidNo reply', async (t) => {
  const askYesNo = broadcastFactory.getValidAskYesNo();
  const saidNoTemplate = askYesNo.templates.saidNo;
  t.context.req.topic = askYesNo;
  sandbox.stub(requestHelper, 'changeTopic')
    .returns(Promise.resolve(true));
  sandbox.stub(helpers.replies, 'saidNo')
    .returns(underscore.noop);

  await requestHelper.executeSaidNoMacro(t.context.req);
  requestHelper.changeTopic.should.have.been.calledWith(t.context.req, saidNoTemplate.topic);
  helpers.replies.saidNo
    .should.have.been.calledWith(t.context.req, t.context.res, saidNoTemplate.text);
});

// executeSaidYesMacro
test('executeSaidYesMacro should call post campaign activity if new topic has campaign, then send the saidYes reply', async (t) => {
  const askYesNo = broadcastFactory.getValidAskYesNo();
  const saidYesTemplate = askYesNo.templates.saidYes;
  t.context.req.topic = askYesNo;
  sandbox.stub(requestHelper, 'changeTopic')
    .returns(Promise.resolve(true));
  sandbox.stub(requestHelper, 'hasCampaign')
    .returns(true);
  sandbox.stub(requestHelper, 'postCampaignActivity')
    .returns(Promise.resolve());
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);

  await requestHelper.executeSaidYesMacro(t.context.req);
  requestHelper.changeTopic.should.have.been.calledWith(t.context.req, saidYesTemplate.topic);
  requestHelper.postCampaignActivity.should.have.been.calledWith(t.context.req, askYesNo.id);
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, saidYesTemplate.text, 'saidYes');
});

test('executeSaidYesMacro should not post campaign activity if new topic does not have campaign', async (t) => {
  const askYesNo = broadcastFactory.getValidAskYesNo();
  const saidYesTemplate = askYesNo.templates.saidYes;
  t.context.req.topic = askYesNo;
  sandbox.stub(requestHelper, 'changeTopic')
    .returns(Promise.resolve(true));
  sandbox.stub(requestHelper, 'hasCampaign')
    .returns(false);
  sandbox.stub(gambitCampaigns, 'postCampaignActivity')
    .returns(Promise.resolve());
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);

  await requestHelper.executeSaidYesMacro(t.context.req);
  requestHelper.changeTopic.should.have.been.calledWith(t.context.req, saidYesTemplate.topic);
  gambitCampaigns.postCampaignActivity.should.not.have.been.called;
  helpers.replies.sendReply
    .should.have.been.calledWith(t.context.req, t.context.res, saidYesTemplate.text, 'saidYes');
});

// getCampaignActivityPayload
test('getCampaignActivityPayload returns object with properties from req', (t) => {
  t.context.req.userId = userId;
  t.context.req.lastOutboundBroadcastId = stubs.getContentfulId();
  t.context.req.campaign = campaignFactory.getValidCampaign();
  t.context.req.topic = topicFactory.getValidTopic();
  t.context.req.inboundMessageText = stubs.getRandomMessageText();
  t.context.req.mediaUrl = stubs.getAttachment().url;
  t.context.req.platform = stubs.getPlatform();

  const result = requestHelper.getCampaignActivityPayload(t.context.req);
  result.userId.should.equal(userId);
  result.campaignId.should.equal(t.context.req.campaign.id);
  result.campaignRunId.should.equal(t.context.req.campaign.currentCampaignRun.id);
  result.text.should.equal(t.context.req.inboundMessageText);
  result.mediaUrl.should.equal(t.context.req.mediaUrl);
  result.postType.should.equal(t.context.req.topic.postType);
  result.platform.should.equal(t.context.req.platform);
  result.broadcastId.should.equal(t.context.req.lastOutboundBroadcastId);
  result.should.not.have.property('keyword');
});

test('getCampaignActivityPayload returns object with broadcastId set to given broadcastId arg', (t) => {
  const broadcastId = stubs.getContentfulId();
  t.context.req.campaign = campaignFactory.getValidCampaign();
  t.context.req.topic = topicFactory.getValidTopic();
  const result = requestHelper.getCampaignActivityPayload(t.context.req, broadcastId);
  result.broadcastId.should.equal(broadcastId);
});

test('getCampaignActivityPayload returns object with keyword set if req.keyword', (t) => {
  t.context.req.campaign = campaignFactory.getValidCampaign();
  t.context.req.topic = topicFactory.getValidTopic();
  t.context.req.keyword = stubs.getRandomWord();
  const result = requestHelper.getCampaignActivityPayload(t.context.req);
  result.keyword.should.equal(t.context.req.keyword);
});

test('getCampaignActivityPayload should throw if req.campaign undefined', (t) => {
  t.throws(() => requestHelper.getCampaignActivityPayload(t.context.req));
});

// getRivescriptReply
test('getRivescriptReply should call helpers.rivescript.getBotReply with req vars', async (t) => {
  t.context.req.userId = userId;
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = stubs.getContentfulId();
  t.context.req.inboundMessageText = stubs.getRandomMessageText();
  const mockRivescriptTopicId = 'random';
  const mockRivescriptTopic = { id: mockRivescriptTopicId };
  const botReply = { text: stubs.getRandomMessageText(), match: '@hello' };
  sandbox.stub(helpers.rivescript, 'getBotReply')
    .returns(Promise.resolve(botReply));
  sandbox.stub(helpers.topic, 'getRivescriptTopicById')
    .returns(mockRivescriptTopic);
  const result = await requestHelper.getRivescriptReply(t.context.req);
  helpers.rivescript.getBotReply.should.have.been
    .calledWith(userId, t.context.req.currentTopicId, t.context.req.inboundMessageText);
  result.text.should.equal(botReply.text);
  result.match.should.equal(botReply.match);
  result.topic.should.deep.equal(mockRivescriptTopic);
});

// hasCampaign
test('hasCampaign should return boolean of whether req.campaign defined', (t) => {
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

// isLastOutboundAskContinue
test('isLastOutboundAskContinue should return whether if req.lastOutboundTemplate is an askContinue template', (t) => {
  sandbox.stub(helpers.template, 'isAskContinueTemplate')
    .returns(true);
  t.context.req.lastOutboundTemplate = stubs.getRandomWord();
  t.truthy(requestHelper.isLastOutboundAskContinue(t.context.req));
  helpers.template.isAskContinueTemplate
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

// isTwilio
test('isTwilio should return true if req.query.origin is set to twilio', (t) => {
  t.falsy(requestHelper.isTwilio(t.context.req));
  t.context.req.query.origin = config.origin.twilio;
  t.truthy(requestHelper.isTwilio(t.context.req));
});

test('isTwilio should return true if isTwilioStudio', (t) => {
  sandbox.stub(requestHelper, 'isTwilioStudio')
    .returns(true);
  t.truthy(requestHelper.isTwilio(t.context.req));
});

// isTwilioStudio
test('isTwilioStudio should return true if req.query.origin is set to twilioStudio', (t) => {
  t.falsy(requestHelper.isTwilioStudio(t.context.req));
  t.context.req.query.origin = config.origin.twilioStudio;
  t.truthy(requestHelper.isTwilioStudio(t.context.req));
});

// parseAskYesNoResponse
test('parseAskYesNoResponse updates macro if parseAskYesNoResponse returns isSaidYesMacro', async (t) => {
  const mockParseAskYesNoResponse = 'dragon';
  sandbox.stub(message, 'updateMacro')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'parseAskYesNoResponse')
    .returns(Promise.resolve(mockParseAskYesNoResponse));
  sandbox.stub(helpers.macro, 'isSaidYes')
    .returns(true);
  sandbox.stub(helpers.request, 'setMacro')
    .returns(underscore.noop);
  t.context.req.inboundMessage = message;

  await requestHelper.parseAskYesNoResponse(t.context.req);
  helpers.rivescript.parseAskYesNoResponse.should.have.been
    .calledWith(message.text);
  helpers.macro.isSaidYes.should.have.been.calledWith(mockParseAskYesNoResponse);
  helpers.request.setMacro.should.have.been.calledWith(t.context.req, mockParseAskYesNoResponse);
  message.updateMacro.should.have.been.calledWith(mockParseAskYesNoResponse);
});

test('parseAskYesNoResponse updates macro if parseAskYesNoResponse returns isSaidMacro', async (t) => {
  const mockParseAskYesNoResponse = 'dragon';
  sandbox.stub(message, 'updateMacro')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'parseAskYesNoResponse')
    .returns(Promise.resolve(mockParseAskYesNoResponse));
  sandbox.stub(helpers.macro, 'isSaidYes')
    .returns(false);
  sandbox.stub(helpers.macro, 'isSaidNo')
    .returns(true);
  sandbox.stub(helpers.request, 'setMacro')
    .returns(underscore.noop);
  t.context.req.inboundMessage = message;

  await requestHelper.parseAskYesNoResponse(t.context.req);
  helpers.rivescript.parseAskYesNoResponse.should.have.been
    .calledWith(message.text);
  helpers.macro.isSaidYes.should.have.been.calledWith(mockParseAskYesNoResponse);
  helpers.macro.isSaidNo.should.have.been.calledWith(mockParseAskYesNoResponse);
  helpers.request.setMacro.should.have.been.calledWith(t.context.req, mockParseAskYesNoResponse);
  message.updateMacro.should.have.been.calledWith(mockParseAskYesNoResponse);
});


test('parseAskYesNoResponse does not update macro if parseAskYesNoResponse does not return saidYes or saidNo', async (t) => {
  const mockParseAskYesNoResponse = 'dragon';
  sandbox.stub(message, 'updateMacro')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'parseAskYesNoResponse')
    .returns(Promise.resolve(mockParseAskYesNoResponse));
  sandbox.stub(helpers.macro, 'isSaidYes')
    .returns(false);
  sandbox.stub(helpers.macro, 'isSaidNo')
    .returns(false);
  sandbox.stub(helpers.request, 'setMacro')
    .returns(underscore.noop);
  t.context.req.inboundMessage = message;

  await requestHelper.parseAskYesNoResponse(t.context.req);
  helpers.rivescript.parseAskYesNoResponse.should.have.been
    .calledWith(message.text);
  helpers.macro.isSaidYes.should.have.been.calledWith(mockParseAskYesNoResponse);
  helpers.macro.isSaidNo.should.have.been.calledWith(mockParseAskYesNoResponse);
  helpers.request.setMacro.should.not.have.been.called;
  message.updateMacro.should.not.have.been.called;
});

// postCampaignActivity
test('postCampaignActivity should post getCampaignActivityPayload as campaignActivity', async () => {
  const postData = { text: stubs.getRandomMessageText() };
  const postResult = { data: 123 };
  sandbox.stub(requestHelper, 'getCampaignActivityPayload')
    .returns(postData);
  sandbox.stub(gambitCampaigns, 'postCampaignActivity')
    .returns(Promise.resolve(postResult));

  const result = await requestHelper.postCampaignActivity();
  gambitCampaigns.postCampaignActivity.should.have.been.calledWith(postData);
  result.should.deep.equal(postResult);
});

// isSaidNoMacro
test('isSaidNoMacro returns whether req.askYesNoResponse equals no', (t) => {
  t.context.req.macro = helpers.macro.macros.saidYes();
  t.falsy(requestHelper.isSaidNoMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.saidNo();
  t.truthy(requestHelper.isSaidNoMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.changeTopic();
  t.falsy(requestHelper.isSaidNoMacro(t.context.req));
});

// isSaidYesMacro
test('isSaidYesMacro returns whether req.askYesNoResponse equals yes', (t) => {
  t.context.req.macro = helpers.macro.macros.saidYes();
  t.truthy(requestHelper.isSaidYesMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.saidNo();
  t.falsy(requestHelper.isSaidYesMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.changeTopic();
  t.falsy(requestHelper.isSaidYesMacro(t.context.req));
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
  t.context.req.currentTopicId.should.equal(conversation.topic);
  const conversationId = conversation.id;
  const currentTopicId = conversation.topic;
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({
    conversationId,
    currentTopicId,
  });
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
  const topicId = topic.id;
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ topicId });
  requestHelper.setCampaign.should.have.been.calledWith(t.context.req, topic.campaign);
});

test('setTopic should not call setCampaign if topic.campaign undefined', (t) => {
  sandbox.spy(requestHelper, 'setCampaign');
  const campaignlessTopic = topicFactory.getValidTopic();
  campaignlessTopic.campaign = null;
  requestHelper.setTopic(t.context.req, campaignlessTopic);
  t.context.req.topic.should.equal(campaignlessTopic);
  helpers.analytics.addCustomAttributes
    .should.have.been.calledWith({ topicId: campaignlessTopic.id });
  requestHelper.setCampaign.should.not.have.been.called;
});

// setUserId
test('setUserId should inject a userId property to req', (t) => {
  requestHelper.setUserId(t.context.req, userId);
  t.context.req.userId.should.equal(userId);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ userId });
});
