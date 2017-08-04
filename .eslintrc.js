module.exports = {
  extends: '@dosomething/eslint-config/nodejs/6.x',
  globals: {
    app: true
  },
  parserOptions: {
    sourceType: 'script'
  },
  rules: {
    strict: [2, 'global'],
    'no-underscore-dangle': [
      'error', {
        "allow": [
          "_id"
        ]
      }
    ]
  }
};
