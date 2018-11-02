'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const queryString = require('query-string');

const logger = require('../../../../lib/logger');
const stubs = require('../../../helpers/stubs');
const broadcastFactory = require('../../../helpers/factories/broadcast');
const userFactory = require('../../../helpers/factories/user');

const config = require('../../../../config/lib/helpers/tags');
const userConfig = require('../../../../config/lib/helpers/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// app modules
const mustache = require('mustache');

// module to be tested
const tagsHelper = require('../../../../lib/helpers/tags');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const mockBroadcast = broadcastFactory.getValidAutoReplyBroadcast();
const mockText = stubs.getRandomMessageText();
const mockUser = userFactory.getValidUser();
const mockTags = { season: 'winter' };

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  t.context.req = httpMocks.createRequest();
});

// Cleanup
test.afterEach((t) => {
  sandbox.restore();
  t.context.req = {};
});

// getLink
test('getLink should return a string with linkConfig values', (t) => {
  const findPollingLocatorConfig = config.links.pollingLocator.find;
  const result = tagsHelper.getLink(findPollingLocatorConfig, t.context.req);
  const query = queryString.stringify(findPollingLocatorConfig.query);
  result.should.equal(`${findPollingLocatorConfig.url}?${query}`);
});

// getLinksTag
test('getLinksTag should return an object', (t) => {
  const result = tagsHelper.getLinksTag(t.context.req);
  result.pollingLocator.should.have.property('find');
  result.pollingLocator.should.have.property('share');
});

// render
test('render should return a string', () => {
  sandbox.stub(mustache, 'render')
    .returns(mockText);
  sandbox.stub(tagsHelper, 'getTags')
    .returns(mockTags);
  const result = tagsHelper.render(mockText, {});
  mustache.render.should.have.been.called;
  result.should.equal(mockText);
});

test('render should throw if mustache.render fails', () => {
  sandbox.stub(mustache, 'render')
    .returns(new Error());
  sandbox.stub(tagsHelper, 'getTags')
    .returns(mockTags);
  tagsHelper.render(mockText, mockTags).should.throw;
});

test('render should throw if getTags fails', () => {
  sandbox.stub(tagsHelper, 'getTags')
    .returns(new Error());
  tagsHelper.render(mockText, mockTags).should.throw;
});

test('render should replace user vars', (t) => {
  t.context.req.user = mockUser;
  const result = tagsHelper.render('{{user.id}}', t.context.req);
  result.should.equal(mockUser.id);
});

// getTags
test('getTags should return an object', (t) => {
  const broadcastTag = { id: stubs.getContentfulId() };
  const linksTag = { url: stubs.getRandomMessageText() };
  const userTag = { id: stubs.getContentfulId() };
  sandbox.stub(tagsHelper, 'getBroadcastTag')
    .returns(broadcastTag);
  sandbox.stub(tagsHelper, 'getLinksTag')
    .returns(linksTag);
  sandbox.stub(tagsHelper, 'getUserTag')
    .returns(userTag);
  t.context.req.user = mockUser;

  const result = tagsHelper.getTags(t.context.req);
  result.should.deep.equal({
    broadcast: broadcastTag,
    links: linksTag,
    user: userTag,
  });
});

test('getTags should return empty object for user if req.user undefined', (t) => {
  const result = tagsHelper.getTags(t.context.req);
  result.user.should.deep.equal({});
});

// getBroadcastLinkQueryParams
test('getBroadcastLinkQueryParams should return object with broadcast_id set if broadcast exists', (t) => {
  t.context.req.broadcast = mockBroadcast;
  const result = tagsHelper.getBroadcastLinkQueryParams(t.context.req);
  result.broadcast_id.should.equal(mockBroadcast.id);
});

test('getBroadcastLinkQueryParams returns empty object if broadcast undefined', (t) => {
  const result = tagsHelper.getBroadcastLinkQueryParams(t.context.req);
  result.should.deep.equal({});
});

// getUserLinkQueryParams
test('getUserLinkQueryParams should return object with user_id set if user exists', (t) => {
  t.context.req.user = mockUser;
  const result = tagsHelper.getUserLinkQueryParams(t.context.req);
  result.user_id.should.equal(mockUser.id);
});

test('getUserLinkQueryParams returns empty object if req.user undefined', (t) => {
  const result = tagsHelper.getUserLinkQueryParams(t.context.req);
  result.should.deep.equal({});
});

// getVotingPlan
test('getVotingPlan returns an object with description, attendingWith, methodOfTransport, and timeOfDay string properties', () => {
  const attendingWith = stubs.getRandomWord();
  const methodOfTransport = stubs.getRandomWord();
  const timeOfDay = stubs.getRandomWord();
  const description = stubs.getRandomMessageText();
  sandbox.stub(tagsHelper, 'getVotingPlanAttendingWith')
    .returns(attendingWith);
  sandbox.stub(tagsHelper, 'getVotingPlanMethodOfTransport')
    .returns(methodOfTransport);
  sandbox.stub(tagsHelper, 'getVotingPlanTimeOfDay')
    .returns(timeOfDay);
  sandbox.stub(mustache, 'render')
    .returns(description);

  const result = tagsHelper.getVotingPlan(mockUser);
  result.should.deep.equal({ attendingWith, methodOfTransport, timeOfDay, description });
});

// getVotingPlanAttendingWith
test('getVotingPlanAttendingWith returns votingPlan.attendingWith config for user votingPlanAttendingWith value', () => {
  const fieldConfig = userConfig.fields.votingPlanAttendingWith;
  Object.keys(fieldConfig.values).forEach((value) => {
    const user = userFactory.getValidUser();
    const fieldValue = fieldConfig.values[value];
    user[fieldConfig.name] = fieldValue;
    const result = tagsHelper.getVotingPlanAttendingWith(user);
    result.should.equal(config.user.votingPlan.vars.attendingWith[fieldValue]);
  });
});

// getVotingPlanMethodOfTransport
test('getVotingPlanMethodOfTransport returns votingPlan.methodOfTransport config for user votingPlanMethodOfTransport value', () => {
  const fieldConfig = userConfig.fields.votingPlanMethodOfTransport;
  Object.keys(fieldConfig.values).forEach((value) => {
    const user = userFactory.getValidUser();
    const fieldValue = fieldConfig.values[value];
    user[fieldConfig.name] = fieldValue;
    const result = tagsHelper.getVotingPlanMethodOfTransport(user);
    result.should.equal(config.user.votingPlan.vars.methodOfTransport[fieldValue]);
  });
});

// getVotingPlanTimeOfDay
test('getVotingPlanTimeOfDay returns votingPlan.timeOfDay config for user votingPlanTimeOfDay value', () => {
  const fieldConfig = userConfig.fields.votingPlanTimeOfDay;
  Object.keys(fieldConfig.values).forEach((value) => {
    const user = userFactory.getValidUser();
    const fieldValue = fieldConfig.values[value];
    user[fieldConfig.name] = fieldValue;
    const result = tagsHelper.getVotingPlanTimeOfDay(user);
    result.should.equal(config.user.votingPlan.vars.timeOfDay[fieldValue]);
  });
});
