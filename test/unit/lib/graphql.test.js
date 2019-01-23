'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const graphqlRequest = require('graphql-request');
const stubs = require('../../helpers/stubs');
const conversationTriggerFactory = require('../../helpers/factories/conversationTrigger');
const topicFactory = require('../../helpers/factories/topic');
const config = require('../../../config/lib/graphql');

chai.should();
chai.use(sinonChai);

// module to be tested
const graphql = require('../../../lib/graphql');

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchConversationTriggers
test('fetchConversationTriggers should call request with query config and return response.conversationTriggers', async () => {
  const conversationTrigger = conversationTriggerFactory.getValidConversationTrigger();
  const conversationTriggers = [conversationTrigger, conversationTrigger];
  sandbox.stub(graphql, 'request')
    .returns(Promise.resolve({ conversationTriggers }));

  const result = await graphql.fetchConversationTriggers();
  graphql.request.should.have.been.calledWith(config.queries.fetchConversationTriggers);
  result.should.deep.equal(conversationTriggers);
});

// fetchTopicById
test('fetchTopicById should call request with query config and id variable and return response.topic', async () => {
  const topic = topicFactory.getValidTopic();
  const id = topic.id;
  sandbox.stub(graphql, 'request')
    .returns(Promise.resolve({ topic }));

  const result = await graphql.fetchTopicById(id);
  graphql.request.should.have.been.calledWith(config.queries.fetchTopicById, { id });
  result.should.deep.equal(topic);
});

// request
test('request should call graphqlRequest.request with given query and variables', async () => {
  const variables = { id: '123' };
  const response = { name: stubs.getRandomWord() };
  sandbox.stub(graphqlRequest, 'request')
    .returns(Promise.resolve(response));

  const result = await graphql.request(config.queries.fetchTopicById, variables);
  graphqlRequest.request
    .should.have.been.calledWith(`${config.url}/graphql`, config.queries.fetchTopicById, variables);
  result.should.deep.equal(response);
});
