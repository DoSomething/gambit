'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const userSchema = new mongoose.Schema({
  _id: String,
  topic: String,
});

module.exports = mongoose.model('users', userSchema);
