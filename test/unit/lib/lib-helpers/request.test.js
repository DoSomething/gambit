'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const DraftSubmission = require('../../../../app/models/DraftSubmission');
const helpers = require('../../../../lib/helpers');
const logger = require('../../../../lib/logger');
const stubs = require('../../../helpers/stubs');
const campaignFactory = require('../../../helpers/factories/campaign');
const draftSubmissionFactory = require('../../../helpers/factories/draftSubmission');
const conversationFactory = require('../../../helpers/factories/conversation');
const topicFactory = require('../../../helpers/factories/topic');
const userFactory = require('../../../helpers/factories/user');

const config = require('../../../../config/lib/helpers/request');

chai.should();
chai.use(sinonChai);

// module to be tested
const requestHelper = require('../../../../lib/helpers/request');

const sandbox = sinon.sandbox.create();

const campaignId = stubs.getCampaignId();
const userId = stubs.getUserId();
const platformUserId = stubs.getMobileNumber();
// TODO: Add signup factory and refactor tests that reference this signupId const.
const signupId = stubs.getCampaignId();
const conversation = conversationFactory.getValidConversation();
const message = conversation.lastOutboundMessage;
const topic = topicFactory.getValidTopic();

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(helpers.analytics, 'addCustomAttributes')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
});

test.afterEach((t) => {
  t.context.req = {};
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// updateTopicIfChanged
test('updateTopicIfChanged does not call setTopic if not a topic change', async (t) => {
  sandbox.stub(requestHelper, 'updateTopicIfChanged')
    .returns(underscore.noop);
  sandbox.stub(conversation, 'setTopic')
    .returns(Promise.resolve(true));
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = topic.id;

  await requestHelper.updateTopicIfChanged(t.context.req, topic);
  requestHelper.updateTopicIfChanged.should.have.been.calledWith(t.context.req, topic);
  conversation.setTopic.should.not.have.been.called;
});

test('updateTopicIfChanged calls setTopic when topic arg is not equal to req.currentTopicId', async (t) => {
  sandbox.stub(requestHelper, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(conversation, 'setTopic')
    .returns(Promise.resolve());
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = 'abc';

  await requestHelper.updateTopicIfChanged(t.context.req, topic);
  requestHelper.setTopic.should.have.been.calledWith(t.context.req, topic);
  conversation.setTopic.should.have.been.calledWith(topic);
});

// createDraftSubmission
test('createDraftSubmission returns DraftSubmission for conversationId and topicId', async (t) => {
  t.context.req.conversation = conversationFactory.getValidConversation();
  t.context.req.topic = topicFactory.getValidTopic();
  const draft = draftSubmissionFactory.getValidNewDraftSubmission();
  sandbox.stub(t.context.req.conversation, 'createDraftSubmission')
    .returns(Promise.resolve(draft));

  const result = await requestHelper.createDraftSubmission(t.context.req);
  t.context.req.conversation.createDraftSubmission
    .should.have.been.calledWith(t.context.req.topic.id);
  result.should.deep.equal(draft);
});

// deleteDraftSubmission
test('deleteDraftSubmission deletes the DB document for req.draftSubmission.id', async (t) => {
  const draft = draftSubmissionFactory.getValidNewDraftSubmission();
  sandbox.stub(DraftSubmission, 'deleteOne')
    .returns(Promise.resolve());
  t.context.req.draftSubmission = draft;

  await requestHelper.deleteDraftSubmission(t.context.req);
  DraftSubmission.deleteOne.should.have.been.calledWith({ _id: draft._id });
});

// executeInboundTopicChange
test('executeInboundTopicChange get topic, create signup if topic has active campaign, and return changeTopic', async (t) => {
  const keyword = 'dragon';
  const platform = stubs.getPlatform();
  t.context.req.rivescriptReplyTopicId = stubs.getContentfulId();
  t.context.req.macro = stubs.getRandomWord();
  t.context.req.platform = platform;
  sandbox.stub(requestHelper, 'updateTopicIfChanged')
    .returns(Promise.resolve(true));
  sandbox.stub(helpers.topic, 'hasActiveCampaign')
    .returns(true);
  sandbox.stub(helpers.user, 'fetchOrCreateSignup')
    .returns(Promise.resolve(stubs.getSignup()));
  t.context.req.user = userFactory.getValidUser();
  t.context.req.conversation = conversation;

  await requestHelper.executeInboundTopicChange(t.context.req, topic, keyword);

  helpers.user.fetchOrCreateSignup
    .should.have.been.calledWith(t.context.req.user, topic.campaign, platform, keyword);
  requestHelper.updateTopicIfChanged
    .should.have.been.calledWith(t.context.req, topic);
});

test('executeInboundTopicChange does not create signup if topic does not have active campaign', async (t) => {
  const keyword = 'dragon';
  t.context.req.rivescriptReplyTopicId = stubs.getContentfulId();
  t.context.req.macro = stubs.getRandomWord();
  t.context.req.platform = stubs.getPlatform();
  sandbox.stub(requestHelper, 'updateTopicIfChanged')
    .returns(Promise.resolve(true));
  sandbox.stub(helpers.topic, 'hasActiveCampaign')
    .returns(false);
  sandbox.stub(helpers.user, 'fetchOrCreateSignup')
    .returns(Promise.resolve(stubs.getSignup()));
  t.context.req.user = userFactory.getValidUser();
  t.context.req.conversation = conversation;

  await requestHelper.executeInboundTopicChange(t.context.req, topic, keyword);

  helpers.user.fetchOrCreateSignup.should.not.have.been.called;
  requestHelper.updateTopicIfChanged
    .should.have.been.calledWith(t.context.req, topic);
});

// getDraftSubmission
test('getDraftSubmission returns DraftSubmission for conversationId and topicId if exists', async (t) => {
  t.context.req.conversation = conversationFactory.getValidConversation();
  t.context.req.topic = topicFactory.getValidTopic();
  const draft = draftSubmissionFactory.getValidCompletePhotoPostDraftSubmission();
  sandbox.stub(t.context.req.conversation, 'getDraftSubmission')
    .returns(Promise.resolve(draft));

  const result = await requestHelper.getDraftSubmission(t.context.req);
  t.context.req.conversation.getDraftSubmission.should.have.been.calledWith(t.context.req.topic.id);
  result.should.deep.equal(draft);
});

// getRivescriptReply
test('getRivescriptReply should call helpers.rivescript.getBotReply with req vars', async (t) => {
  t.context.req.userId = userId;
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = stubs.getContentfulId();
  t.context.req.inboundMessageText = stubs.getRandomMessageText();
  // TODO: This should be renamed as default topic the way we're using it -- stub getDefaultTopicId.
  const mockRivescriptTopicId = 'random';
  const mockRivescriptTopic = { id: mockRivescriptTopicId };
  const botReply = { text: stubs.getRandomMessageText(), match: '@hello' };
  sandbox.stub(helpers.rivescript, 'isBotReady')
    .returns(true);
  sandbox.stub(helpers.rivescript, 'loadBot')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'getBotReply')
    .returns(Promise.resolve(botReply));
  sandbox.stub(helpers.topic, 'getRivescriptTopicById')
    .returns(mockRivescriptTopic);

  const result = await requestHelper.getRivescriptReply(t.context.req);
  helpers.rivescript.getBotReply.should.have.been
    .calledWith(userId, mockRivescriptTopicId, t.context.req.inboundMessageText);
  result.text.should.equal(botReply.text);
  result.match.should.equal(botReply.match);
  helpers.rivescript.loadBot.should.not.have.been.called;
  // TODO: Add tests for various topic changes.
  // result.topicId.should.deep.equal(mockRivescriptTopic);
});

test('getRivescriptReply should call helpers.rivescript.loadBot if bot is not ready', async (t) => {
  t.context.req.userId = userId;
  t.context.req.conversation = conversation;
  t.context.req.currentTopicId = stubs.getContentfulId();
  t.context.req.inboundMessageText = stubs.getRandomMessageText();
  // TODO: This should be renamed as default topic the way we're using it -- stub getDefaultTopicId.
  const mockRivescriptTopicId = 'random';
  const mockRivescriptTopic = { id: mockRivescriptTopicId };
  const botReply = { text: stubs.getRandomMessageText(), match: '@hello' };
  sandbox.stub(helpers.rivescript, 'isBotReady')
    .returns(false);
  sandbox.stub(helpers.rivescript, 'loadBot')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'getBotReply')
    .returns(Promise.resolve(botReply));
  sandbox.stub(helpers.topic, 'getRivescriptTopicById')
    .returns(mockRivescriptTopic);

  await requestHelper.getRivescriptReply(t.context.req);
  helpers.rivescript.loadBot.should.have.been.called;
});

// hasCampaign
test('hasCampaign should return boolean of whether req.campaign defined', (t) => {
  t.context.req.campaign = campaignFactory.getValidCampaign();
  t.truthy(requestHelper.hasCampaign(t.context.req));
  t.context.req.campaign = null;
  t.falsy(requestHelper.hasCampaign(t.context.req));
});

// hasDraftSubmission
test('hasDraftSubmission should return boolean of whether req.draftSubmission defined', (t) => {
  t.context.req.draftSubmission = draftSubmissionFactory.getValidNewDraftSubmission();
  t.truthy(requestHelper.hasDraftSubmission(t.context.req));
  t.context.req.draftSubmission = null;
  t.falsy(requestHelper.hasDraftSubmission(t.context.req));
});

// hasDraftSubmissionValue
test('hasDraftSubmissionValue should return boolean of whether req.draftSubmission.values has property for key', (t) => {
  const key = 'caption';
  t.context.req.draftSubmission = draftSubmissionFactory.getValidNewDraftSubmission();
  t.falsy(requestHelper.hasDraftSubmissionValue(t.context.req, key));
  t.context.req.draftSubmission = draftSubmissionFactory.getValidCompletePhotoPostDraftSubmission();
  t.truthy(requestHelper.hasDraftSubmission(t.context.req, key));
});

// hasSignupWithWhyParticipated
test('hasSignupWithWhyParticipated should return true if fetchSignup result has why_participated', async (t) => {
  t.context.req.user = userFactory.getValidUser();
  t.context.req.topic = topicFactory.getValidPhotoPostConfig();
  sandbox.stub(helpers.user, 'fetchSignup')
    .returns(Promise.resolve({
      id: signupId,
      why_participated: stubs.getRandomMessageText(),
    }));

  const result = await requestHelper.hasSignupWithWhyParticipated(t.context.req);
  t.truthy(result);
  helpers.user.fetchSignup
    .should.have.been.calledWith(t.context.req.user, t.context.req.topic.campaign);
});

test('hasSignupWithWhyParticipated should return false if fetchSignup result why_participated undefined', async (t) => {
  t.context.req.user = userFactory.getValidUser();
  t.context.req.topic = topicFactory.getValidPhotoPostConfig();
  sandbox.stub(helpers.user, 'fetchSignup')
    .returns(Promise.resolve({ id: signupId }));

  const result = await requestHelper.hasSignupWithWhyParticipated(t.context.req);
  t.falsy(result);
  helpers.user.fetchSignup
    .should.have.been.calledWith(t.context.req.user, t.context.req.topic.campaign);
});

test('hasSignupWithWhyParticipated should return false if fetchSignup result is null', async (t) => {
  t.context.req.user = userFactory.getValidUser();
  t.context.req.topic = topicFactory.getValidPhotoPostConfig();
  sandbox.stub(helpers.user, 'fetchSignup')
    .returns(Promise.resolve(null));

  const result = await requestHelper.hasSignupWithWhyParticipated(t.context.req);
  t.falsy(result);
  helpers.user.fetchSignup
    .should.have.been.calledWith(t.context.req.user, t.context.req.topic.campaign);
});

// isStartCommand
test('isStartCommand should return true if trimmed lowercase req.inboundMessageText is equal to start command', (t) => {
  t.falsy(requestHelper.isStartCommand(t.context.req));
  t.context.req.inboundMessageText = 'top chef';
  t.falsy(requestHelper.isStartCommand(t.context.req));
  t.context.req.inboundMessageText = ` ${config.commands.start} `;
  t.truthy(requestHelper.isStartCommand(t.context.req));
});

// isSubscriptionStatusActiveMacro
test('isSubscriptionStatusActiveMacro should return true if req.macro is subscriptionStatusActive macro', (t) => {
  t.falsy(requestHelper.isSubscriptionStatusActiveMacro(t.context.req));
  t.context.req.macro = stubs.getRandomWord();
  t.falsy(requestHelper.isSubscriptionStatusActiveMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.subscriptionStatusActive();
  t.truthy(requestHelper.isSubscriptionStatusActiveMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.subscriptionStatusLess();
  t.falsy(requestHelper.isSubscriptionStatusActiveMacro(t.context.req));
});

// isSubscriptionStatusLessMacro
test('isSubscriptionStatusLessMacro should return true if req.macro is subscriptionStatusLess macro', (t) => {
  t.falsy(requestHelper.isSubscriptionStatusLessMacro(t.context.req));
  t.context.req.macro = stubs.getRandomWord();
  t.falsy(requestHelper.isSubscriptionStatusLessMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.subscriptionStatusActive();
  t.falsy(requestHelper.isSubscriptionStatusLessMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.subscriptionStatusLess();
  t.truthy(requestHelper.isSubscriptionStatusLessMacro(t.context.req));
});

// isSubscriptionStatusNeedMoreInfoMacro
test('isSubscriptionStatusNeedMoreInfoMacro should return true if req.macro is subscriptionStatusNeedMoreInfo macro', (t) => {
  t.falsy(requestHelper.isSubscriptionStatusNeedMoreInfoMacro(t.context.req));
  t.context.req.macro = stubs.getRandomWord();
  t.falsy(requestHelper.isSubscriptionStatusNeedMoreInfoMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.subscriptionStatusActive();
  t.falsy(requestHelper.isSubscriptionStatusNeedMoreInfoMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.subscriptionStatusNeedMoreInfo();
  t.truthy(requestHelper.isSubscriptionStatusNeedMoreInfoMacro(t.context.req));
});

// isVotingPlanStatusCantVoteMacro
test('isVotingPlanStatusCantVoteMacro should return true if req.macro is votingPlanStatusCantVote macro', (t) => {
  t.falsy(requestHelper.isVotingPlanStatusCantVoteMacro(t.context.req));
  t.context.req.macro = stubs.getRandomWord();
  t.falsy(requestHelper.isVotingPlanStatusCantVoteMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.votingPlanStatusVoted();
  t.falsy(requestHelper.isVotingPlanStatusCantVoteMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.votingPlanStatusCantVote();
  t.truthy(requestHelper.isVotingPlanStatusCantVoteMacro(t.context.req));
});

// isVotingPlanStatusNotVotingMacro
test('isVotingPlanStatusNotVotingMacro should return true if req.macro is votingPlanStatusNotVoting macro', (t) => {
  t.falsy(requestHelper.isVotingPlanStatusNotVotingMacro(t.context.req));
  t.context.req.macro = stubs.getRandomWord();
  t.falsy(requestHelper.isVotingPlanStatusNotVotingMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.votingPlanStatusVoted();
  t.falsy(requestHelper.isVotingPlanStatusNotVotingMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.votingPlanStatusNotVoting();
  t.truthy(requestHelper.isVotingPlanStatusNotVotingMacro(t.context.req));
});

// isVotingPlanStatusVotedMacro
test('isVotingPlanStatusVotedMacro should return true if req.macro is votingPlanStatusVoted macro', (t) => {
  t.falsy(requestHelper.isVotingPlanStatusVotedMacro(t.context.req));
  t.context.req.macro = stubs.getRandomWord();
  t.falsy(requestHelper.isVotingPlanStatusVotedMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.votingPlanStatusVoted();
  t.truthy(requestHelper.isVotingPlanStatusVotedMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.votingPlanStatusCantVote();
  t.falsy(requestHelper.isVotingPlanStatusVotedMacro(t.context.req));
});

// isSubscriptionStatusStopMacro
test('isSubscriptionStatusStopMacro should return true if req.macro is subscriptionStatusStop macro', (t) => {
  t.falsy(requestHelper.isSubscriptionStatusStopMacro(t.context.req));
  t.context.req.macro = stubs.getRandomWord();
  t.falsy(requestHelper.isSubscriptionStatusStopMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.subscriptionStatusActive();
  t.falsy(requestHelper.isSubscriptionStatusStopMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.subscriptionStatusStop();
  t.truthy(requestHelper.isSubscriptionStatusStopMacro(t.context.req));
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

// parseAskMultipleChoiceResponse
test('parseAskMultipleChoiceResponse updates macro with helpers.rivescript.parseAskMultipleChoiceResponse result', async (t) => {
  const mockParseMultipleChoiceResponse = stubs.getRandomWord();
  sandbox.stub(helpers.request, 'setMacro')
    .returns(underscore.noop);
  sandbox.stub(message, 'updateMacro')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'parseAskMultipleChoiceResponse')
    .returns(Promise.resolve(mockParseMultipleChoiceResponse));
  t.context.req.inboundMessage = message;

  await requestHelper.parseAskMultipleChoiceResponse(t.context.req);
  helpers.rivescript.parseAskMultipleChoiceResponse.should.have.been
    .calledWith(message.text);
  helpers.request.setMacro
    .should.have.been.calledWith(t.context.req, mockParseMultipleChoiceResponse);
  message.updateMacro.should.have.been.calledWith(mockParseMultipleChoiceResponse);
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

// isSaidNoMacro
test('isSaidNoMacro returns whether req.askYesNoResponse equals no', (t) => {
  t.context.req.macro = helpers.macro.macros.saidYes();
  t.falsy(requestHelper.isSaidNoMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.saidNo();
  t.truthy(requestHelper.isSaidNoMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.votingPlanStatusVoting();
  t.falsy(requestHelper.isSaidNoMacro(t.context.req));
});

// isSaidYesMacro
test('isSaidYesMacro returns whether req.askYesNoResponse equals yes', (t) => {
  t.context.req.macro = helpers.macro.macros.saidYes();
  t.truthy(requestHelper.isSaidYesMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.saidNo();
  t.falsy(requestHelper.isSaidYesMacro(t.context.req));
  t.context.req.macro = helpers.macro.macros.votingPlanStatusVoting();
  t.falsy(requestHelper.isSaidYesMacro(t.context.req));
});

// saveDraftSubmissionValue
test('saveDraftSubmissionValue should add a new key value pair to existing req.draftSubmission.values', (t) => {
  const draft = draftSubmissionFactory.getValidCompletePhotoPostDraftSubmission();
  sandbox.spy(draft, 'markModified');
  sandbox.spy(draft, 'save');
  t.context.req.draftSubmission = draft;
  const mockKey = stubs.getRandomWord();
  const mockValue = stubs.getRandomMessageText();

  requestHelper.saveDraftSubmissionValue(t.context.req, mockKey, mockValue);
  const keyValuePair = {};
  keyValuePair[mockKey] = mockValue;
  t.context.req.draftSubmission.values
    .should.deep.equal(Object.assign(draft.values, keyValuePair));
  draft.markModified.should.have.been.calledWith('values');
  draft.save.should.have.been.called;
});

// setCampaign
test('setCampaign should inject a campaign property to req and call setCampaignId if !req.campaignId', (t) => {
  sandbox.spy(requestHelper, 'setCampaignId');
  const campaign = campaignFactory.getValidCampaign();

  requestHelper.setCampaign(t.context.req, campaign);
  t.context.req.campaign.should.deep.equal(campaign);
  requestHelper.setCampaignId.should.have.been.calledWith(t.context.req, campaign.id);
});

// setCampaignId
test('setCampaignId should inject a campaignId property to req', (t) => {
  requestHelper.setCampaignId(t.context.req, campaignId);
  t.context.req.campaignId.should.equal(campaignId);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ campaignId });
});

// setConversation
test('setConversation should inject a conversation property to req', (t) => {
  sandbox.stub(requestHelper, 'setLastOutboundMessageProperties')
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
  requestHelper.setLastOutboundMessageProperties
    .should.have.been.calledWith(t.context.req, message);
});

test('setConversation should not call setLastOutboundMessage does not exist', (t) => {
  const newConversation = conversationFactory.getValidConversation();
  newConversation.lastOutboundMessage = null;
  sandbox.stub(requestHelper, 'setLastOutboundMessageProperties')
    .returns(underscore.noop);

  requestHelper.setConversation(t.context.req, newConversation);
  requestHelper.setLastOutboundMessageProperties.should.not.have.been.called;
});

// setDraftSubmission
test('setDraftSubmission should return boolean of whether req.draftSubmission defined', (t) => {
  const draftSubmission = draftSubmissionFactory.getValidNewDraftSubmission();

  requestHelper.setDraftSubmission(t.context.req, draftSubmission);
  t.context.req.draftSubmission.should.deep.equal(draftSubmission);
  helpers.analytics.addCustomAttributes
    .should.have.been.calledWith({ draftSubmissionId: draftSubmission.id });
});

test('setLastOutboundMessageProperties should inject lastOutbound properties to req', (t) => {
  requestHelper.setLastOutboundMessageProperties(t.context.req, message);
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
