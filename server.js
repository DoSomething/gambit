'use strict';

const app = require('./app');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/slothie');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  return app.listen(5000, () => {
    console.log(`Slothie is listening.`);
  });
});
