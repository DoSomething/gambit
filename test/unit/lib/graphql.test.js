'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const graphqlRequest = require('graphql-request');
const topicFactory = require('../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const graphql = require('../../../lib/graphql');

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchTopicById
test('fetchTopicById should execute GraphQL request and return result.topic', async () => {
  const topic = topicFactory.getValidTopic();
  const topicId = topic.id;
  sandbox.stub(graphqlRequest, 'request')
    .returns(Promise.resolve({ topic }));

  const result = await graphql.fetchTopicById(topicId);
  graphqlRequest.request.should.have.been.called;
  result.should.deep.equal(topic);
});
