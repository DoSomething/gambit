'use strict';

const superagent = require('superagent');

const URI = process.env.DS_GAMBIT_API_BASEURI;

class Gambit {
  static executeGet(endpoint) {
    return superagent
      .get(`${URI}/${endpoint}`)
      .then(response => response.body.data)
      .catch(err => console.log(`gambit response:${err.message}`));
  }
}

module.exports = Gambit;
