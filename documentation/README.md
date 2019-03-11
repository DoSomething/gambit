# Gambit Conversations

This is __Gambit Conversations__, the DoSomething.org multi-platform chatbot service.

## Schema
See [Wiki](https://github.com/DoSomething/gambit/wiki/Schema) for details on the Message model schema and properties.

## Authentication
See [Authentication](authentication.md) for details on authorizing your requests.

## Endpoints

### v2

Endpoint | Functionality                                           
-------- | -------------
`GET /api/v2/broadcasts/:id` | [Retrieve a broadcast](endpoints/broadcasts.md).
`POST /api/v2/messages` | [Create a message](endpoints/messages.md).
`PATCH /api/v2/messages/:messageId` | [Update a message](endpoints/messages.md).
`GET /api/v2/rivescript` | [Retrieve loaded Rivescript](endpoints/rivescript.md).

### v1

All v1 endpoints expose the Conversations database via [Express Restify Mongoose](https://florianholzapfel.github.io/express-restify-mongoose/).

Endpoint | Functionality                                           
-------- | -------------
`GET /api/v1/conversations` | Retrieve conversations.
`GET /api/v1/conversations/:id` | Retrieve a conversation.
`GET /api/v1/draftSubmissions` | Retrieve draftSubmission.
`GET /api/v1/draftSubmissions/:id` | Retrieve a draftSubmission.
`GET /api/v1/messages` | Retrieve messages.
`GET /api/v1/messages/:id` | Retrieve a message.

### Usage

See [docs](https://florianholzapfel.github.io/express-restify-mongoose/).

* Filtering

    * https://gambit-conversations-staging.herokuapp.com/api/v1/messages?query={"platform":"slack"}
    * https://gambit-conversations-staging.herokuapp.com/api/v1/messages?query={"createdAt":{"$gt":"2017-06-24T00:34:11.114Z"}}

* Sorting

    * https://gambit-conversations-staging.herokuapp.com/api/v1/messages?sort=-createdAt
