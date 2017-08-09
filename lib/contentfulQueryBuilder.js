'use strict';

/**
 * Query Builder class
 */
class QueryBuilder {
  constructor() {
    this.query = {};
  }
  contentType(type) {
    this.query.content_type = type;
    return this;
  }
  broadcastId(id) {
    this.query['fields.broadcastId'] = id;
    return this;
  }
  campaignId(id) {
    this.query['fields.campaignId'] = id;
    return this;
  }
  keyword(keyword) {
    this.query['fields.keyword'] = keyword;
    return this;
  }
  environment(env) {
    this.query['fields.environment'] = env;
    return this;
  }
  custom(queryObject = {}) {
    const keys = Object.keys(queryObject);
    keys.forEach((queryKey) => {
      this.query[queryKey] = queryObject[queryKey];
    });
    return this;
  }
  build() {
    return this.query;
  }
}

module.exports = QueryBuilder;
