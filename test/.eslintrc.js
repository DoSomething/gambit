module.exports = {
  extends: '@dosomething/eslint-config/server/ava',
  rules:  {
    'no-underscore-dangle': [
      'error',
      {
        'allow': [
          '__set__',
          '__get__',
          '_id',
        ]
      }
    ],
  },
};
