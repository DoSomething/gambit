'use strict';

// Must be updated if the MongoDB message schema changes.
const SCHEMA_VERSION = 1;

const DIRECTION = {
  inbound: 'inbound',
  outboundReply: 'outbound-reply',
  outboundApi: 'outbound-api-send',
};

function isOutbound(direction) {
  /**
   * The direction is considered to be 'outbound' if it uses the 'outbound' word somewhere
   * in the string. Example: 'outbound-reply' and 'outbound-api-send'.
   * They both qualify as outbound.
   */
  return direction.includes('outbound');
}

function isInbound(direction) {
  return direction === DIRECTION.inbound;
}

module.exports = {
  DIRECTION,
  isOutbound,
  isInbound,
  SCHEMA_VERSION,
};
