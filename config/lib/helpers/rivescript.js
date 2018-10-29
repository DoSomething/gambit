'use strict';

/**
 * @see @see https://www.rivescript.com/docs/tutorial#the-code-explained
 */
module.exports = {
  cacheKey: 'contentApi',
  commands: {
    // @see https://www.rivescript.com/docs/tutorial#redirections
    redirect: '@',
    reply: '-',
    newline: '^',
    trigger: '+',
  },
  separators: {
    command: ' ',
    line: '\n',
  },
};
