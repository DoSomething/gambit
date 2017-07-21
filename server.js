'use strict';

const app = require('./app');
const mongoose = require('mongoose');
const restify = require('express-restify-mongoose');
const config = require('./config');

app.use((req, res, next) => {
  if (! config.corsEnabled) {
    return next();
  }

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  return next();
});

mongoose.connect(config.dbUri);
mongoose.Promise = global.Promise;

const ConversationModel = require('./app/models/Conversation');
const MessageModel = require('./app/models/Message');

restify.serve(app, ConversationModel);
restify.serve(app, MessageModel);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  app.listen(config.port, () => {
    console.log(`Slothie is running on port=${config.port}.`);
  });
});
