'use strict';

/**
 * Sends response with an object and given data property
 */
function sendData(res, data) {
  return res.send({ data });
}

module.exports = {
  sendData,
};
