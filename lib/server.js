'use strict';

/* eslint-disable global-require */
function start() {
  const config = require('../config');
  const logger = require('./logger');
  const app = require('../app');

  // Setup rogue client.
  require('./rogue').getClient();

  // Start mongoose connection
  require('../config/mongoose')(config.dbUri);

  const mongoose = require('mongoose');

  /**
   * For practical reasons, a Connection equals a Db.
   * @see http://mongoosejs.com/docs/4.x/docs/api.html#connection_Connection
   */
  const db = mongoose.connection;

  logger.info('worker process started.');

  // Register connection open listener
  db.once('open', () => {
    app.listen(config.port, () => logger.info(`Conversations API is running on port=${config.port}.`));
  });
}

module.exports = {
  start,
};
