'use strict';

/**
 * @see @see https://www.rivescript.com/docs/tutorial#the-code-explained
 */
module.exports = {
  cacheKey: 'contentApi',
  commands: {
    trigger: '+',
    // @see https://www.rivescript.com/docs/tutorial#redirections
    redirect: '@',
    reply: '-',
  },
  separators: {
    command: ' ',
    line: '\n',
  },
};
