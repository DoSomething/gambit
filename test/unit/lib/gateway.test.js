'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');
const { GatewayClient } = require('@dosomething/gateway/server');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

const stubs = require('../../helpers/stubs');
const userFactory = require('../../helpers/factories/user');

const gatewayApiStub = GatewayClient.getNewInstance();
const mockPost = { id: stubs.getPostId() };
const mockSignup = stubs.getSignup();
const mockUser = userFactory.getValidUser();

// Module to test
const gateway = rewire('../../../lib/gateway');

test.afterEach(() => {
  sandbox.restore();
});

// createPost
test('createPost should call gateway.getClient.Posts.create', async () => {
  const mockPayload = { northstar_id: mockUser.id };
  const mockGatewayResponse = { data: mockPost };
  sandbox.stub(gatewayApiStub.Rogue.Posts, 'create')
    .returns(Promise.resolve(mockGatewayResponse));
  sandbox.stub(gateway, 'getClient')
    .returns(gatewayApiStub);

  const result = await gateway.createPost(mockPayload);
  gateway.getClient.should.have.been.called;
  gatewayApiStub.Rogue.Posts.create.should.have.been.calledWith(mockPayload);
  result.should.deep.equal(mockGatewayResponse);
});

// TODO: Add test for truncated text post.

// createSignup
test('createSignup should call gateway.getClient.Signup.create', async () => {
  const mockPayload = { northstar_id: mockUser.id, campaignId: stubs.getCampaignId() };
  const mockGatewayResponse = { data: stubs.getSignup() };
  sandbox.stub(gatewayApiStub.Rogue.Signups, 'create')
    .returns(Promise.resolve(mockGatewayResponse));
  sandbox.stub(gateway, 'getClient')
    .returns(gatewayApiStub);

  const result = await gateway.createSignup(mockPayload);
  gateway.getClient.should.have.been.called;
  gatewayApiStub.Rogue.Signups.create.should.have.been.calledWith(mockPayload);
  result.should.deep.equal(mockGatewayResponse);
});

// fetchPosts
test('fetchPosts should call gateway.getClient.Posts.index', async () => {
  const mockQuery = { 'filter[northstar_id]': mockUser.id };
  const mockGatewayResponse = { data: [mockPost] };
  sandbox.stub(gatewayApiStub.Rogue.Posts, 'index')
    .returns(Promise.resolve(mockGatewayResponse));
  sandbox.stub(gateway, 'getClient')
    .returns(gatewayApiStub);

  const result = await gateway.fetchPosts(mockQuery);
  gateway.getClient.should.have.been.called;
  gatewayApiStub.Rogue.Posts.index.should.have.been.calledWith(mockQuery);
  result.should.deep.equal(mockGatewayResponse);
});

// fetchSignups
test('fetchSignups should call gateway.getClient.Signups.index', async () => {
  const mockQuery = { 'filter[northstar_id]': mockUser.id };
  const mockGatewayResponse = { data: [mockSignup] };
  sandbox.stub(gatewayApiStub.Signups, 'index')
    .returns(Promise.resolve(mockGatewayResponse));
  sandbox.stub(gateway, 'getClient')
    .returns(gatewayApiStub);

  const result = await gateway.fetchSignups(mockQuery);
  gateway.getClient.should.have.been.called;
  gatewayApiStub.Rogue.Signups.index.should.have.been.calledWith(mockQuery);
  result.should.deep.equal(mockGatewayResponse);
});
