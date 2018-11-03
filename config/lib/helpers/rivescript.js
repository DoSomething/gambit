'use strict';

/**
 * @see @see https://www.rivescript.com/docs/tutorial#the-code-explained
 */
module.exports = {
  cacheKey: 'contentApi',
  commands: {
    // A continuinuation is needed if a reply contains line breaks.
    // @see https://www.rivescript.com/docs/tutorial#line-breaking
    continuation: '^',
    // @see https://www.rivescript.com/docs/tutorial#redirections
    redirect: '@',
    reply: '-',
    trigger: '+',
  },
  separators: {
    command: ' ',
    line: '\n',
  },
};
