'use strict';

// Must be updated if the MongoDB message schema changes.
const SCHEMA_VERSION = 1;

const DIRECTION = {
  inbound: 'inbound',
  outboundReply: 'outbound-reply',
  outboundApi: 'outbound-api-send',
};

function isOutbound(direction) {
  return direction.includes('outbound');
}

function isInbound(direction) {
  return direction === DIRECTION.inbound;
}

function isOutboundApi(direction) {
  return direction === DIRECTION.outboundReply;
}

module.exports = {
  DIRECTION,
  isOutbound,
  isInbound,
  isOutboundApi,
  SCHEMA_VERSION,
};
