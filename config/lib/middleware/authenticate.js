'use strict';

module.exports = {
  auth: {
    name: process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_NAME,
    pass: process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_PASS,
  },
  unauthorizedErrorMessage: 'Invalid or missing auth parameters. Unauthorized.',
  unauthorizedErrorCode: 401,
};
