'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const Message = require('../../../app/models/Message');
const helpers = require('../../../lib/helpers');
const stubs = require('../../helpers/stubs');
const conversationFactory = require('../../helpers/factories/conversation');
const userFactory = require('../../helpers/factories/user');

const tagsHelper = helpers.tags;
const conversation = conversationFactory.getValidConversation();
const alexaConversation = conversationFactory.getValidConversation('alexa');
const mockMessageText = stubs.getRandomMessageText();
const mockUser = userFactory.getValidUser();

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
// const Conversation = require('../../../app/models/Conversation');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.user, 'fetchById')
    .returns(mockUser);
  sandbox.stub(helpers.user, 'fetchByMobile')
    .returns(mockUser);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// createMessage
test('createMessage should call helpers.tag.render if direction is not inbound', async (t) => {
  sandbox.stub(tagsHelper, 'render')
    .returns(mockMessageText);
  sandbox.stub(Message, 'create')
    .returns(underscore.noop);

  await conversation.createMessage('outbound-api-send', mockMessageText, 'temp', t.context.req);
  tagsHelper.render.should.have.been.called;
  Message.create.should.have.been.called;
});

test('createMessage should not call helpers.tag.render if direction is inbound', async (t) => {
  sandbox.stub(tagsHelper, 'render')
    .returns(mockMessageText);
  sandbox.stub(Message, 'create')
    .returns(underscore.noop);

  await conversation.createMessage('inbound', mockMessageText, 'temp', t.context.req);
  tagsHelper.render.should.not.have.been.called;
  Message.create.should.have.been.called;
});

// getNorthstarUser
test('getNorthstarUser should return northstar.fetchUserByMobile for SMS', async () => {
  const result = await conversation.getNorthstarUser();
  helpers.user.fetchByMobile.should.have.been.called;
  result.should.equal(mockUser);
});

test('getNorthstarUser should return northstar.fetchById for non SMS', async () => {
  const result = await alexaConversation.getNorthstarUser();
  helpers.user.fetchById.should.have.been.called;
  result.should.equal(mockUser);
});

// isSms
test('isSms should return boolean', (t) => {
  let result = conversation.isSms();
  t.truthy(result);

  result = alexaConversation.isSms();
  t.falsy(result);
});
