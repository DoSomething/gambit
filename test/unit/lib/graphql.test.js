'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const graphqlRequest = require('graphql-request');
const stubs = require('../../helpers/stubs');
const topicFactory = require('../../helpers/factories/topic');
const config = require('../../../config/lib/graphql');

chai.should();
chai.use(sinonChai);

// module to be tested
const graphql = require('../../../lib/graphql');

const fetchTopicbyIdQuery = config.queries.fetchTopicById;

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchTopicById
test('fetchTopicById should call request with query config and id variable and return response.topic', async () => {
  const topic = topicFactory.getValidTopic();
  const id = topic.id;
  sandbox.stub(graphql, 'request')
    .returns(Promise.resolve({ topic }));

  const result = await graphql.fetchTopicById(id);
  graphql.request.should.have.been.calledWith(fetchTopicbyIdQuery, { id });
  result.should.deep.equal(topic);
});

// fetchTopicById
test('request should call graphql-request.request with given query and variables', async () => {
  const variables = { id: '123' };
  const response = { name: stubs.getRandomWord() };
  sandbox.stub(graphqlRequest, 'request')
    .returns(Promise.resolve(response));

  const result = await graphql.request(fetchTopicbyIdQuery, variables);
  graphqlRequest.request
    .should.have.been.calledWith(`${config.url}/graphql`, fetchTopicbyIdQuery, variables);
  result.should.deep.equal(response);
});
