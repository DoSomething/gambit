'use strict';

module.exports = {
  shouldSendErrorIfNotFound: true,
  /**
   * If true, it will fetch the user's public properties by requesting them without authenticating.
   * These properties are cached in Fastly and returned at a fraction of the speed
   * of an authenticated request.
   */
  shouldFetchUnauthenticated: true,
};
