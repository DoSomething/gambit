'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');
const { RogueClient } = require('@dosomething/gateway/server');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

const stubs = require('../../helpers/stubs');
const userFactory = require('../../helpers/factories/user');

const rogueApiStub = RogueClient.getNewInstance();
const mockPost = { id: stubs.getCampaignRunId() };
const mockUser = userFactory.getValidUser();

// Module to test
const rogue = rewire('../../../lib/rogue');

test.afterEach(() => {
  sandbox.restore();
});

// createPost
test('createPost should call rogue.getClient.Posts.create', async () => {
  const mockPayload = { northstar_id: mockUser.id };
  const mockRogueResponse = { data: mockPost };
  sandbox.stub(rogueApiStub.Posts, 'create')
    .returns(Promise.resolve(mockRogueResponse));
  sandbox.stub(rogue, 'getClient')
    .returns(rogueApiStub);

  const result = await rogue.createPost(mockPayload);
  rogue.getClient.should.have.been.called;
  rogueApiStub.Posts.create.should.have.been.calledWith(mockPayload);
  result.should.deep.equal(mockRogueResponse);
});

// getPosts
test('getPosts should call rogue.getClient.Posts.index', async () => {
  const mockQuery = { 'filter[northstar_id]': mockUser.id };
  const mockRogueResponse = { data: [mockPost] };
  sandbox.stub(rogueApiStub.Posts, 'index')
    .returns(Promise.resolve(mockRogueResponse));
  sandbox.stub(rogue, 'getClient')
    .returns(rogueApiStub);

  const result = await rogue.getPosts(mockQuery);
  rogue.getClient.should.have.been.called;
  rogueApiStub.Posts.index.should.have.been.calledWith(mockQuery);
  result.should.deep.equal(mockRogueResponse);
});
