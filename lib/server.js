'use strict';

/* eslint-disable global-require */
function start() {
  const config = require('../config');
  const logger = require('./logger');
  const app = require('../app');
  // const rateLimiters = require('./rate-limiters').getRegistry();

  // Setup Gateway client.
  require('./gateway').getClient();

  /**
   * Start mongoose connection
   * @see https://mongoosejs.com/docs/4.x/docs/connections.html#callback
   */
  require('../config/mongoose')(config.dbUri);

  const mongoose = require('mongoose');

  /**
   * For practical reasons, a Connection equals a Db.
   * @see http://mongoosejs.com/docs/4.x/docs/api.html#connection_Connection
   */
  const db = mongoose.connection;

  // Register connection open listener
  db.once('open', () => {
    app.listen(config.port, () => logger.info(`Conversations API is running on port=${config.port}.`));
  });
  logger.info('worker process started.');

  // TODO: register limiters in app object
}

module.exports = {
  start,
};
