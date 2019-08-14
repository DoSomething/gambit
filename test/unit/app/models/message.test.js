'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const Promise = require('bluebird');

const Message = require('../../../../app/models/Message');
const messageFactory = require('../../../helpers/factories/message');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  t.context = {};
  sandbox.restore();
});

test('anonymizeByUserId sets text to null', async () => {
  sandbox.stub(Message, 'updateMany').returns({
    exec: () => Promise.resolve(true),
  });
  const message = messageFactory.getValidMessage('inbound');
  await Message.anonymizeByUserId(message.userId);

  Message.updateMany.should.have.been.called;
});

test('anonymizeByUserId should not call updateMany if userId is undefined', async () => {
  sandbox.stub(Message, 'updateMany').returns({
    exec: () => Promise.resolve(true),
  });
  try {
    await Message.anonymizeByUserId();
  } catch (error) {
    // just catching so it doesn't break the test
  }
  Message.updateMany.should.not.have.been.called;
});
