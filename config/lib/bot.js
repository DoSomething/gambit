'use strict';

module.exports = {
  debug: process.env.RIVESCRIPT_DEBUG,
  directory: 'brain',
  concat: 'newline',
  macroNames: ['post_signup', 'decline_signup', 'gambit', 'noReply'],
  menuCommand: 'menu',
};
