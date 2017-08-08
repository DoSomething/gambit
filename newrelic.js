'use strict';

/**
 * New Relic agent configuration.
 *
 */
exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  agent_enabled: process.env.NEW_RELIC_ENABLED,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: process.env.NEW_RELIC_LOGGING_LEVEL,
  },
};
