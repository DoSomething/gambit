'use strict';

/* eslint-disable global-require */
function start() {
  const config = require('../config');
  const logger = require('./logger');
  const app = require('../app');

  // Initializes rate limiters
  require('./rate-limiters').getRegistry();

  // Initializes Gateway client.
  require('./gateway').getClient();

  /**
   * Start mongoose connection
   * @see https://mongoosejs.com/docs/connections.html#callback
   */
  require('../config/mongoose')(config.dbUri);

  const mongoose = require('mongoose');

  /**
   * For practical reasons, a Connection equals a Db.
   * @see https://mongoosejs.com/docs/api/connection.html#connection_Connection
   */
  const db = mongoose.connection;

  // Register connection open listener
  db.once('open', () => {
    app.listen(config.port, () => logger.info(`Conversations API is running on port=${config.port}.`));
  });

  logger.info('worker process started.');
}

module.exports = {
  start,
};
