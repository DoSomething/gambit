'use strict';

const superagent = require('superagent');
const URI = process.env.GAMBIT_API_BASEURI;

class Gambit {
  get(endpoint) {
    return superagent
      .get(`${URI}/${endpoint}`)
      .then(response => console.log(`gambit response:${JSON.stringify(response.body)}`))
      .catch(err => console.log(`gambit response:${err.message}`));
  }
}

module.exports = Gambit;
