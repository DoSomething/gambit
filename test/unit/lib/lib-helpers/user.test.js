'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const underscore = require('underscore');
const httpMocks = require('node-mocks-http');
const northstar = require('../../../../lib/northstar');
const gateway = require('../../../../lib/gateway');
const helpers = require('../../../../lib/helpers');
const config = require('../../../../config/lib/helpers/user');

chai.should();
chai.use(sinonChai);

// module to be tested
const userHelper = require('../../../../lib/helpers/user');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const stubs = require('../../../helpers/stubs');
const campaignFactory = require('../../../helpers/factories/campaign');
const conversationFactory = require('../../../helpers/factories/conversation');
const draftSubmissionFactory = require('../../../helpers/factories/draftSubmission');
const messageFactory = require('../../../helpers/factories/message');
const userFactory = require('../../../helpers/factories/user');
const topicFactory = require('../../../helpers/factories/topic');

const campaign = campaignFactory.getValidCampaign();
const campaignId = stubs.getCampaignId();
const mockPost = { id: 890332 };
const mockGatewayPhotoPostResponse = stubs.gateway.getCreatePostResponse();
const mockGatewayTextPostResponse = stubs.gateway.getCreatePostResponse('text');
const mockGatewaySignupResponse = stubs.gateway.getCreateSignupResponse();
const mockGatewaySignupsIndexResponse = stubs.gateway.getSignupsIndexResponse();
const mockUser = userFactory.getValidUser();
const mockPhotoPostTopic = topicFactory.getValidPhotoPostConfig();
const mockTextPostTopic = topicFactory.getValidTextPostConfig();
const userLookupStub = () => Promise.resolve(mockUser);
const platformUserAddressStub = {
  country: 'US',
};
const source = stubs.getPlatform();

test.beforeEach((t) => {
  t.context.req = httpMocks.createRequest();
  // US-NY
  t.context.req.platformUserStateISOCode = helpers.twilio.getMemberStateISOCode(
    'NY'
  );
});

test.afterEach((t) => {
  t.context = {};
  sandbox.restore();
});

// createPhotoPost
test('createPhotoPost passes user.id, campaignId, file, quantity, source, text, and whyParticipated args to gateway.createSignup', async (t) => {
  const file = stubs.getRandomMessageText();
  const draftSubmission = draftSubmissionFactory.getValidCompletePhotoPostDraftSubmission();
  const values = draftSubmission.values;
  sandbox
    .stub(gateway, 'createPost')
    .returns(Promise.resolve(mockGatewayPhotoPostResponse));
  sandbox
    .stub(gateway, 'getClient')
    .returns({ photoPostCreation: { fileProperty: 'file' } });
  sandbox
    .stub(helpers.util, 'fetchImageFileFromUrl')
    .returns(Promise.resolve(file));

  const result = await userHelper.createPhotoPost({
    userId: mockUser.id,
    actionId: mockPhotoPostTopic.actionId,
    photoPostSource: source,
    photoPostValues: values,
    location: t.context.req.platformUserStateISOCode,
  });
  gateway.createPost.should.have.been.calledWith({
    file,
    action_id: mockPhotoPostTopic.actionId,
    quantity: values.quantity,
    northstar_id: mockUser.id,
    source,
    type: config.posts.photo.type,
    why_participated: values.whyParticipated,
    location: t.context.req.platformUserStateISOCode,
  });
  result.should.deep.equal(mockGatewayPhotoPostResponse);
  helpers.util.fetchImageFileFromUrl.should.have.been.calledWith(values.url);
});

// createSignup
test('createSignup passes user.id, campaignId, source args to gateway.createSignup', async () => {
  const details = 'test';
  sandbox
    .stub(gateway, 'createSignup')
    .returns(Promise.resolve(mockGatewaySignupResponse));

  const result = await userHelper.createSignup(
    mockUser,
    campaign,
    source,
    details
  );
  gateway.createSignup.should.have.been.calledWith({
    campaign_id: campaign.id,
    northstar_id: mockUser.id,
    source,
    details,
  });
  result.should.deep.equal(mockGatewaySignupResponse);
});

// createTextPost
test('createTextPost passes user.id, campaignId, source, and text fields to gateway.createSignup', async (t) => {
  const text = 'test';
  sandbox
    .stub(gateway, 'createPost')
    .returns(Promise.resolve(mockGatewayTextPostResponse));

  const result = await userHelper.createTextPost({
    userId: mockUser.id,
    actionId: mockTextPostTopic.actionId,
    textPostSource: source,
    textPostText: text,
    location: t.context.req.platformUserStateISOCode,
  });
  gateway.createPost.should.have.been.calledWith({
    action_id: mockTextPostTopic.actionId,
    northstar_id: mockUser.id,
    source,
    text,
    type: config.posts.text.type,
    location: t.context.req.platformUserStateISOCode,
  });
  result.should.deep.equal(mockGatewayTextPostResponse);
});

// createVotingPlan
test('createVotingPlan passes user voting plan info to gateway.createPost', async (t) => {
  const mockValues = { test: stubs.getRandomWord() };
  sandbox.stub(gateway, 'createPost').returns(Promise.resolve(mockPost));
  sandbox.stub(userHelper, 'getVotingPlanValues').returns(mockValues);
  const details = JSON.stringify(mockValues);

  const result = await userHelper.createVotingPlan(
    mockUser,
    source,
    t.context.req.platformUserStateISOCode
  );
  gateway.createPost.should.have.been.calledWith({
    action_id: config.posts.votingPlan.actionId,
    northstar_id: mockUser.id,
    source,
    text: details,
    type: config.posts.votingPlan.type,
    location: t.context.req.platformUserStateISOCode,
  });
  result.should.deep.equal(mockPost);
});

// fetchOrCreateSignup
test('fetchOrCreateSignup returns createSignup result if fetchSignup result is null', async () => {
  sandbox.stub(userHelper, 'fetchSignup').returns(Promise.resolve(null));
  sandbox
    .stub(userHelper, 'createSignup')
    .returns(Promise.resolve(mockGatewaySignupResponse));

  const result = await userHelper.fetchOrCreateSignup(mockUser, campaign);
  userHelper.fetchSignup.should.have.calledWith(mockUser, campaign);
  userHelper.createSignup.should.have.calledWith(mockUser, campaign);
  result.should.deep.equal(mockGatewaySignupResponse);
});

test('fetchOrCreateSignup returns fetchSignup result if exists', async () => {
  sandbox
    .stub(userHelper, 'fetchSignup')
    .returns(Promise.resolve(mockGatewaySignupResponse));
  sandbox
    .stub(userHelper, 'createSignup')
    .returns(Promise.resolve(mockGatewaySignupResponse));

  const result = await userHelper.fetchOrCreateSignup(mockUser, campaign);
  userHelper.fetchSignup.should.have.been.calledWith(mockUser, campaign);
  userHelper.createSignup.should.not.have.been.called;
  result.should.deep.equal(mockGatewaySignupResponse);
});

// fetchOrCreateVotingPlan
test('fetchOrCreateVotingPlan returns createVotingPlan result if fetchVotingPlan result is null', async () => {
  sandbox.stub(userHelper, 'fetchVotingPlan').returns(Promise.resolve(null));
  sandbox
    .stub(userHelper, 'createVotingPlan')
    .returns(Promise.resolve(mockPost));

  const result = await userHelper.fetchOrCreateVotingPlan(mockUser, source);
  userHelper.fetchVotingPlan.should.have.been.calledWith(mockUser);
  userHelper.createVotingPlan.should.have.been.calledWith(mockUser, source);
  result.should.deep.equal(mockPost);
});

test('fetchOrCreateVotingPlan returns fetchVotingPlan result if exists', async () => {
  sandbox
    .stub(userHelper, 'fetchVotingPlan')
    .returns(Promise.resolve(mockPost));
  sandbox
    .stub(userHelper, 'createVotingPlan')
    .returns(Promise.resolve({ id: stubs.getRandomWord() }));

  const result = await userHelper.fetchOrCreateVotingPlan(mockUser, source);
  userHelper.fetchVotingPlan.should.have.been.calledWith(mockUser);
  userHelper.createVotingPlan.should.not.have.been.called;
  result.should.deep.equal(mockPost);
});

// fetchById
test('fetchById calls northstar.fetchUserById', async () => {
  sandbox.stub(northstar, 'fetchUserById').returns(userLookupStub);

  const result = await userHelper.fetchById(mockUser.id);
  northstar.fetchUserById.should.have.been.called;
  result.should.deep.equal(userLookupStub);
});

// fetchByMobile
test('fetchByMobile calls northstar.fetchUserById', async () => {
  sandbox.stub(northstar, 'fetchUserByMobile').returns(userLookupStub);

  const result = await userHelper.fetchByMobile(mockUser.mobile);
  northstar.fetchUserByMobile.should.have.been.called;
  result.should.deep.equal(userLookupStub);
});

// fetchFromReq
test('fetchFromReq calls fetchById if !req.platformUserId', async (t) => {
  sandbox.stub(userHelper, 'fetchById').returns(userLookupStub);
  sandbox.stub(userHelper, 'fetchByMobile').returns(userLookupStub);
  t.context.req.userId = stubs.getUserId();

  await userHelper.fetchFromReq(t.context.req);
  userHelper.fetchById.should.not.have.been.calledWith(
    t.context.req,
    t.context.req.userId
  );
  userHelper.fetchByMobile.should.not.have.been.called;
});

test('fetchFromReq calls fetchByMobile if req.platformUserId', async (t) => {
  sandbox.stub(userHelper, 'fetchById').returns(userLookupStub);
  sandbox.stub(userHelper, 'fetchByMobile').returns(userLookupStub);
  t.context.req.platformUserId = stubs.getMobileNumber();

  await userHelper.fetchFromReq(t.context.req);
  userHelper.fetchByMobile.should.have.been.called;
  userHelper.fetchById.should.not.have.been.called;
});

// fetchSignup
test('fetchSignup should call gateway.fetchSignups with getFetchSignupsQuery result and return first result', async () => {
  sandbox.spy(userHelper, 'getFetchSignupsQuery');
  sandbox
    .stub(gateway, 'fetchSignups')
    .returns(Promise.resolve(mockGatewaySignupsIndexResponse));

  const result = await userHelper.fetchSignup(mockUser, campaign);
  userHelper.getFetchSignupsQuery.should.have.been.calledWith(
    mockUser.id,
    campaign.id
  );
  gateway.fetchSignups.should.have.been.calledWith(
    userHelper.getFetchSignupsQuery(mockUser.id, campaign.id)
  );
  result.should.deep.equal(mockGatewaySignupsIndexResponse.data[0]);
});

test('fetchSignup should return null if fetchSignup result is empty array', async (t) => {
  sandbox.stub(gateway, 'fetchSignups').returns(Promise.resolve({ data: [] }));

  const result = await userHelper.fetchSignup(mockUser, campaign);
  t.is(result, null);
});

// fetchVotingPlan
test('fetchVotingPlan should call gateway.getPosts with query for user voting plan', async () => {
  const mockQuery = { test: '123' };
  sandbox.stub(userHelper, 'getFetchVotingPlanQuery').returns(mockQuery);
  sandbox
    .stub(gateway, 'fetchPosts')
    .returns(Promise.resolve({ data: [mockPost] }));

  const result = await userHelper.fetchVotingPlan(mockUser);
  gateway.fetchPosts.should.have.been.calledWith(mockQuery);
  result.should.deep.equal(mockPost);
});

// getCreatePayloadFromReq
test('getCreatePayloadFromReq should return object', () => {
  const req = {
    platform: stubs.getPlatform(),
    platformUserAddress: platformUserAddressStub,
    platformUserId: stubs.getMobileNumber(),
  };
  sandbox.stub(underscore, 'extend').returns(platformUserAddressStub);
  const result = userHelper.getCreatePayloadFromReq(req);
  result.source.should.equal(req.platform);
  result.mobile.should.equal(req.platformUserId);
});

// getDefaultUpdatePayloadFromReq
test('getDefaultUpdatePayloadFromReq should return object', () => {
  const inboundMessage = messageFactory.getValidMessage();
  const conversation = conversationFactory.getValidConversation();
  const isSupportTopic = true;
  sandbox.stub(conversation, 'isSupportTopic').returns(isSupportTopic);
  const result = userHelper.getDefaultUpdatePayloadFromReq({
    inboundMessage,
    conversation,
  });
  result.last_messaged_at.should.equal(inboundMessage.createdAt.toISOString());
  result.sms_paused.should.equal(isSupportTopic);
});

// getFetchSignupsQuery
test('getFetchSignupsQuery should return object for querying by userId and campaignId', () => {
  const result = userHelper.getFetchSignupsQuery(mockUser.id, campaignId);
  result.should.deep.equal({
    'filter[northstar_id]': mockUser.id,
    'filter[campaign_id]': campaignId,
  });
});

// getFetchVotingPlanQuery
test('getFetchVotingPlanQuery should return getFetchSignupsQuery result with type filter property', () => {
  const result = userHelper.getFetchVotingPlanQuery(mockUser.id);
  result.should.deep.equal({
    'filter[northstar_id]': mockUser.id,
    'filter[action_id]': config.posts.votingPlan.actionId,
    'filter[type]': config.posts.votingPlan.type,
  });
});

// getVotingPlanValues
test('getVotingPlanValues should return object with voting plan field values', () => {
  const votingPlan = {
    attending_with: mockUser[config.fields.votingPlanAttendingWith.name],
    method_of_transport:
      mockUser[config.fields.votingPlanMethodOfTransport.name],
    time_of_day: mockUser[config.fields.votingPlanTimeOfDay.name],
  };
  const result = userHelper.getVotingPlanValues(mockUser);
  result.should.deep.equal(votingPlan);
});

// hasAddress
test('hasAddress should return true if user has address properties set', (t) => {
  const user = userFactory.getValidUserWithAddress();
  t.true(userHelper.hasAddress(user));
});

test('hasAddress should return false if user does not have address properties set', (t) => {
  const user = userFactory.getValidUser();
  t.falsy(userHelper.hasAddress(user));
});

// isPaused
test('isPaused should return user.sms_paused', (t) => {
  const user = userFactory.getValidUser();
  const result = userHelper.isPaused(user);
  t.deepEqual(result, user.sms_paused);
});

// updateByMemberMessageReq
test('updateByMemberMessageReq should return rejected error if getDefaultUpdatePayloadFromReq throws', async (t) => {
  const error = stubs.getError();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq').throws(error);
  t.context.req.macro = stubs.getMacro();

  const result = await t.throwsAsync(() =>
    userHelper.updateByMemberMessageReq(t.context.req)
  );
  result.should.deep.equal(error);
});

test('updateByMemberMessageReq should return rejected error if getProfileUpdate throws', async (t) => {
  const error = stubs.getError();
  sandbox.stub(userHelper, 'getDefaultUpdatePayloadFromReq').returns({});
  sandbox.stub(helpers.macro, 'getProfileUpdate').throws(error);
  t.context.req.macro = stubs.getMacro();

  const result = await t.throwsAsync(() =>
    userHelper.updateByMemberMessageReq(t.context.req)
  );
  result.should.deep.equal(error);
});

test('updateByMemberMessageReq should return northstar.updateUser', async (t) => {
  t.context.req.user = mockUser;
  sandbox
    .stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ abc: 1 });
  sandbox.stub(helpers.macro, 'getProfileUpdate').returns({ def: 2 });
  sandbox.stub(northstar, 'updateUser').returns(Promise.resolve(mockUser));
  sandbox.stub(userHelper, 'hasAddress').returns(false);
  t.context.req.macro = stubs.getMacro();

  const result = await userHelper.updateByMemberMessageReq(t.context.req);
  northstar.updateUser.should.have.been.calledWith(mockUser.id, {
    abc: 1,
    def: 2,
  });
  userHelper.hasAddress.should.not.have.been.called;
  result.should.deep.equal(mockUser);
});

test('updateByMemberMessageReq should not send req.platformUserAddress if user has address', async (t) => {
  t.context.req.user = mockUser;
  sandbox
    .stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ abc: 1 });
  sandbox.stub(helpers.macro, 'getProfileUpdate').returns({ def: 2 });
  sandbox.stub(northstar, 'updateUser').returns(Promise.resolve(mockUser));
  t.context.req.platformUserAddress = { ghi: 3 };
  sandbox.stub(userHelper, 'hasAddress').returns(true);
  t.context.req.macro = stubs.getMacro();

  const result = await userHelper.updateByMemberMessageReq(t.context.req);
  northstar.updateUser.should.have.been.calledWith(mockUser.id, {
    abc: 1,
    def: 2,
  });
  userHelper.hasAddress.should.have.been.calledWith(t.context.req.user);
  result.should.deep.equal(mockUser);
});

test('updateByMemberMessageReq should not send req.platformUserAddress if user does not have address', async (t) => {
  t.context.req.user = mockUser;
  sandbox
    .stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ abc: 1 });
  sandbox.stub(helpers.macro, 'getProfileUpdate').returns({ def: 2 });
  sandbox.stub(northstar, 'updateUser').returns(Promise.resolve(mockUser));
  t.context.req.platformUserAddress = { ghi: 3 };
  sandbox.stub(userHelper, 'hasAddress').returns(false);
  t.context.req.macro = stubs.getMacro();

  const result = await userHelper.updateByMemberMessageReq(t.context.req);
  northstar.updateUser.should.have.been.calledWith(mockUser.id, {
    abc: 1,
    def: 2,
    ghi: 3,
  });
  userHelper.hasAddress.should.have.been.calledWith(t.context.req.user);
  result.should.deep.equal(mockUser);
});

test('updateByMemberMessageReq should call createVotingPlan if macro isCompletedVotingPlan', async (t) => {
  t.context.req.user = mockUser;
  sandbox
    .stub(userHelper, 'getDefaultUpdatePayloadFromReq')
    .returns({ abc: 1 });
  sandbox.stub(helpers.macro, 'getProfileUpdate').returns({ def: 2 });
  sandbox.stub(northstar, 'updateUser').returns(Promise.resolve(mockUser));
  t.context.req.platformUserAddress = { ghi: 3 };
  sandbox.stub(userHelper, 'hasAddress').returns(false);
  t.context.req.macro = stubs.getMacro();
  sandbox.stub(helpers.macro, 'isCompletedVotingPlan').returns(true);
  sandbox
    .stub(helpers.user, 'fetchOrCreateVotingPlan')
    .returns(Promise.resolve(mockPost));

  const result = await userHelper.updateByMemberMessageReq(t.context.req);
  northstar.updateUser.should.have.been.calledWith(mockUser.id, {
    abc: 1,
    def: 2,
    ghi: 3,
  });
  userHelper.hasAddress.should.have.been.calledWith(t.context.req.user);
  helpers.user.fetchOrCreateVotingPlan.should.have.been.calledWith(
    t.context.req.user
  );
  result.should.deep.equal(mockUser);
});
