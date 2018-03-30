# Gambit Conversations

This is __Gambit Conversations__, the DoSomething.org multi-platform chatbot service.

## Authentication
See [Authentication](authentication.md) for details on authorizing your requests.


## Endpoints

### v1

Endpoint | Functionality                                           
-------- | -------------
`GET /api/v1/broadcasts` | Retrieve all Broadcasts.
`GET /api/v1/broadcasts/:id` | [Retrieve a Broadcast](endpoints/broadcasts.md).
`GET /api/v1/conversations` | Retrieve all Conversations.
`GET /api/v1/conversations/:id` | Retrieve a Conversation.
`GET /api/v1/messages` | Retrieve all Messages.
`GET /api/v1/messages/:id` | Retrieve a Message.

### v2

Endpoint | Functionality                                           
-------- | -------------
`POST /api/v2/messages` | [Create a Message](endpoints/messages.md).
`PATCH /api/v2/messages/:messageId` | [Update a Message](endpoints/messages.md).

### Query parameters

The GET Conversation and Messages are served via the Express Restify Mongoose package. [Docs](https://florianholzapfel.github.io/express-restify-mongoose/)

### Filtering
* https://gambit-conversations-staging.herokuapp.com/api/v1/messages?query={"platform":"slack"}
* https://gambit-conversations-staging.herokuapp.com/api/v1/messages?query={"createdAt":{"$gt":"2017-06-24T00:34:11.114Z"}}

### Sort
* https://gambit-conversations-staging.herokuapp.com/api/v1/messages?sort=-createdAt
