'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const logger = require('../../../../lib/logger');
const stubs = require('../../../helpers/stubs');
const broadcastFactory = require('../../../helpers/factories/broadcast');
const userFactory = require('../../../helpers/factories/user');

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
const mockVars = { season: 'winter' };

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  t.context.req = httpMocks.createRequest();
});

// Cleanup
test.afterEach((t) => {
  sandbox.restore();
  t.context.req = {};
});

// render
test('render should return a string', () => {
  sandbox.stub(mustache, 'render')
    .returns(mockText);
  sandbox.stub(tagsHelper, 'getVarsForTags')
    .returns(mockVars);
  const result = tagsHelper.render(mockText, {});
  mustache.render.should.have.been.called;
  result.should.equal(mockText);
});

test('render should throw if mustache.render fails', () => {
  sandbox.stub(mustache, 'render')
    .returns(new Error());
  sandbox.stub(tagsHelper, 'getVarsForTags')
    .returns(mockVars);
  tagsHelper.render(mockText, mockVars).should.throw;
});

test('render should throw if getVarsForTags fails', () => {
  sandbox.stub(tagsHelper, 'getVarsForTags')
    .returns(new Error());
  tagsHelper.render(mockText, mockVars).should.throw;
});

test('render should replace user vars', (t) => {
  t.context.req.user = mockUser;
  const result = tagsHelper.render('{{user.id}}', t.context.req);
  result.should.equal(mockUser.id);
});

// getVarsForTags
test('getVarsForTags should return an object', (t) => {
  const result = tagsHelper.getVarsForTags(t.context.req);
  result.should.be.a('object');
  result.should.have.property('links');
  result.should.have.property('user');
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
