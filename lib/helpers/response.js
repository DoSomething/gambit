'use strict';

/**
 * Sends response with object having a data property set to arg.
 */
function sendData(res, data) {
  return res.send({ data });
}

module.exports = {
  sendData,
};
