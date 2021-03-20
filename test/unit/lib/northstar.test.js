'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');
const underscore = require('underscore');
const Northstar = require('@dosomething/gateway/server');
const config = require('../../../config/lib/northstar');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

const stubs = require('../../helpers/stubs');
const userFactory = require('../../helpers/factories/user');

const northstarApiStub = new Northstar(config.clientOptions);
const mockMobile = stubs.getMobileNumber();
const mockPayload = { mobile: mockMobile };
const mockUser = userFactory.getValidUser();
const mockNorthstarResponse = Promise.resolve(mockUser);
const getUserFields = config.getUserFields;

// Module to test
const northstar = rewire('../../../lib/northstar');

test.afterEach(() => {
  sandbox.restore();
  northstar.__set__('client', undefined);
  northstar.__set__('config', config);
  northstar.__set__('Northstar', undefined);
});

// createNewClient
test('createNewClient should create a new Northstar client by calling Northstar constructor', () => {
  const NorthstarSpy = sandbox.spy();
  northstar.__set__('Northstar', NorthstarSpy);

  northstar.createNewClient();
  NorthstarSpy.should.have.been.calledWithNew;
  NorthstarSpy.should.have.been.calledWith(config.clientOptions);
});

test('createNewClient should throw when Northstar constructor fails', (t) => {
  const failConfig = underscore.extend({}, config, {
    apiToken: 'epicFail',
  });
  northstar.__set__('config', failConfig);

  t.throws(() => northstar.createNewClient());
});

// getClient
test('getClient should return the existing Northstar client if already created', () => {
  // setup
  const NorthstarSpy = sandbox.spy();
  northstar.__set__('Northstar', NorthstarSpy);
  const newClient = northstar.getClient();
  const sameClient = northstar.getClient();

  // test
  NorthstarSpy.should.have.been.calledWithNew;
  NorthstarSpy.should.have.been.calledOnce;
  newClient.should.be.equal(sameClient);
});

// createUser
test('createUser should call Northstar client.Users.create', async () => {
  sandbox.stub(northstarApiStub.Users, 'create')
    .returns(Promise.resolve(mockNorthstarResponse));
  sandbox.stub(northstar, 'getClient')
    .returns(northstarApiStub);


  const result = await northstar.createUser(mockPayload);
  northstar.getClient.should.have.been.called;
  northstarApiStub.Users.create.should.have.been.calledWith(mockPayload);
  result.should.deep.equal(mockUser);
});

// updateUser
test('updateUser should call Northstar client.Users.update', async () => {
  sandbox.stub(northstarApiStub.Users, 'update')
    .returns(Promise.resolve(mockNorthstarResponse));
  sandbox.stub(northstar, 'getClient')
    .returns(northstarApiStub);

  const result = await northstar.updateUser(mockUser.id, mockPayload);
  northstar.getClient.should.have.been.called;
  northstarApiStub.Users.update.should.have.been.calledWith(mockUser.id, mockPayload);
  result.should.deep.equal(mockUser);
});

// fetchUserById
test('fetchUserById should call Northstar client.Users.get', async () => {
  sandbox.stub(northstarApiStub.Users, 'get')
    .returns(Promise.resolve(mockNorthstarResponse));
  sandbox.stub(northstar, 'getClient')
    .returns(northstarApiStub);

  const result = await northstar.fetchUserById(mockUser.id);
  northstar.getClient.should.have.been.called;
  northstarApiStub.Users.get.should.have.been.calledWith(getUserFields.id, mockUser.id);
  result.should.deep.equal(mockUser);
});

// fetchUserByEmail
test('fetchUserByEmail should call Northstar client.Users.get', async () => {
  sandbox.stub(northstarApiStub.Users, 'get')
    .returns(Promise.resolve(mockNorthstarResponse));
  sandbox.stub(northstar, 'getClient')
    .returns(northstarApiStub);

  const result = await northstar.fetchUserByEmail(mockUser.email);
  northstar.getClient.should.have.been.called;
  northstarApiStub.Users.get.should.have.been.calledWith(getUserFields.email, mockUser.email);
  result.should.deep.equal(mockUser);
});

// fetchUserByMobile
test('fetchUserByMobile should call Northstar client.Users.get', async () => {
  sandbox.stub(northstarApiStub.Users, 'get')
    .returns(Promise.resolve(mockNorthstarResponse));
  sandbox.stub(northstar, 'getClient')
    .returns(northstarApiStub);

  const result = await northstar.fetchUserByMobile(mockUser.mobile);
  northstar.getClient.should.have.been.called;
  northstarApiStub.Users.get.should.have.been.calledWith(getUserFields.mobile, mockUser.mobile);
  result.should.deep.equal(mockUser);
});
