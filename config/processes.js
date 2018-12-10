'use strict';

const config = {};
/**
 * Heroku makes it available to help calculate correct concurrency
 * @see https://devcenter.heroku.com/articles/node-concurrency#tuning-the-concurrency-level
 */
config.memoryAvailable = parseInt(process.env.MEMORY_AVAILABLE, 10);
/**
 * Expected MAX memory footprint of a single concurrent process in Megabytes.
 *
 * NOTE: This value is the basis to calculate the Procfile server flag: --max_old_space_size=230
 *       The value in the Procfile is 90% of the estimated processMemory here.
 *       Based on a Heroku recommendation. @see https://blog.heroku.com/node-habits-2016#7-avoid-garbage
 */
config.processMemory = 256;
/**
 * Calculate total amount of concurrent processes to fork
 * based on available memory and estimated process memory footprint
 */
config.total = config.memoryAvailable ?
  Math.floor(config.memoryAvailable / config.processMemory) : 1;

module.exports = config;
