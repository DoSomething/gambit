'use strict';

/**
 * Sends response with object having a data property set to arg.
 */
function sendData(res, data) {
  return res.send({ data });
}

/**
 * Sends response with 204 status.
 */
function sendNoContent(res, message) {
  return res.status(204).send(message);
}

module.exports = {
  sendData,
  sendNoContent,
};
