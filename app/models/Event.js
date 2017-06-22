'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const eventSchema = new mongoose.Schema({
  userId: String,
  type: String,
  data: Object,
});

module.exports = mongoose.model('events', eventSchema);
