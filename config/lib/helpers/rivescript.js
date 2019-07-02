'use strict';

/**
 * @see @see https://www.rivescript.com/docs/tutorial#the-code-explained
 */
module.exports = {
  // Used to determine how to transform defaultTrigger response contentTypes
  // when fetching from GraphQl
  response: {
    types: {
      askMultipleChoice: {
        type: 'askMultipleChoice',
      },
    },
  },
  cacheKey: 'contentApi',
  commands: {
    // A continuation is needed if a reply contains line breaks.
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
