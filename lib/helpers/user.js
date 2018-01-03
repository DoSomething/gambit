'use strict';

module.exports = {
  hasLocation: function hasLocation(user) {
    const result = user.addr_city && user.addr_state && user.addr_zip && user.country;
    return result;
  },
};
