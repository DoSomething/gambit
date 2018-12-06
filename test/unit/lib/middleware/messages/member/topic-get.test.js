'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../../../lib/helpers');
const stubs = require('../../../../../helpers/stubs');
const topicFactory = require('../../../../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const getTopic = require('../../../../../../lib/middleware/messages/member/topic-get');

const sandbox = sinon.sandbox.create();

// stubs
const topic = topicFactory.getValidTopic();
const error = stubs.getError();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'noCampaign')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.currentTopicId = stubs.getContentfulId();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('getTopic calls next if topic.getById result is not deprecated', async (t) => {
  const next = sinon.stub();
  const middleware = getTopic();
  sandbox.stub(helpers.topic, 'getById')
    .returns(Promise.resolve(topic));
  sandbox.stub(helpers.request, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers.topic, 'isDeprecated')
    .returns(false);

  await middleware(t.context.req, t.context.res, next);
  helpers.topic.getById.should.have.been.calledWith(t.context.req.currentTopicId);
  helpers.request.setTopic.should.have.been.calledWith(t.context.req, topic);
  helpers.replies.noCampaign.should.not.have.been.called;
  next.should.have.been.called;
});

test('getTopic sends noCampaign reply if topic.getById result is deprecated', async (t) => {
  const next = sinon.stub();
  const middleware = getTopic();
  sandbox.stub(helpers.topic, 'getById')
    .returns(Promise.resolve(topic));
  sandbox.stub(helpers.request, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers.topic, 'isDeprecated')
    .returns(true);

  await middleware(t.context.req, t.context.res, next);
  helpers.replies.noCampaign.should.have.been.calledWith(t.context.req, t.context.res);
  next.should.not.have.been.called;
});

test('getTopic calls sendErrorResponse if topic.getById returns error', async (t) => {
  const next = sinon.stub();
  const middleware = getTopic();
  sandbox.stub(helpers.topic, 'getById')
    .returns(Promise.reject(error));
  sandbox.stub(helpers.request, 'setTopic')
    .returns(underscore.noop);

  await middleware(t.context.req, t.context.res, next);
  helpers.request.setTopic.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
