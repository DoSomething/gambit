'use strict';

const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config');
const restify = require('express-restify-mongoose');

mongoose.connect(config.dbUri);
mongoose.Promise = global.Promise;

const EventModel = require('./app/models/Event');
const MessageModel = require('./app/models/Message');

restify.serve(app, EventModel);
restify.serve(app, MessageModel);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  app.listen(config.port, () => {
    console.log(`Slothie is running on port=${config.port}.`);
  });
});
