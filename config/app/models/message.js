'use strict';

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
};
