'use strict';

const app = require('./app');
const mongoose = require('mongoose');
const restify = require('express-restify-mongoose');
const config = require('./config');

mongoose.connect(config.dbUri);
mongoose.Promise = global.Promise;

const ActionModel = require('./app/models/Action');
const MessageModel = require('./app/models/Message');
const UserModel = require('./app/models/User');

restify.serve(app, ActionModel);
restify.serve(app, MessageModel);
restify.serve(app, UserModel);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  app.listen(config.port, () => {
    console.log(`Slothie is running on port=${config.port}.`);
  });
});
