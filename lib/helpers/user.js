'use strict';

module.exports = {
  /**
   * @param {object} user
   * @return {boolean}
   */
  hasLocation: function hasLocation(user) {
    if (user.addr_city && user.addr_state && user.addr_zip && user.country) {
      return true;
    }
    return false;
  },
};
