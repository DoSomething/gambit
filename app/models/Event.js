'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const eventSchema = new mongoose.Schema({
  userId: String,
  date: { type: Date, default: Date.now },
  type: String,
  data: Object,
});

module.exports = mongoose.model('events', eventSchema);
