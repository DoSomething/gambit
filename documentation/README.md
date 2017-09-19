# Gambit Conversations

This is __Gambit Conversations__, the DoSomething.org multi-platform chatbot service.

## Authentication
See [Authentication](authentication.md) for details on authorizing your requests.


## Endpoints

Endpoint | Functionality                                           
-------- | -------------
`POST /api/v1/receive-message` | [Receive an inbound Message, and send a reply Message.](endpoints/receive-message.md)
`POST /api/v1/send-message` | [Send an outbound Message](endpoints/send-message.md).
`POST /api/v1/import-message` | [Import an outbound Message](endpoints/import-message.md) that was sent on behalf of another service.
`GET /api/v1/conversations` | Retrieve all Conversations.
`GET /api/v1/conversations/:id` | Retrieve a Conversation.
`GET /api/v1/messages` | Retrieve all Messages.
`GET /api/v1/messages/:id` | Retrieve a Message.
`GET /api/v1/campaigns` | Retrieve all cached Campaigns.
`GET /api/v1/campaigns/:id` | Retrieve a cached Campaign.

### Query paramters

See https://florianholzapfel.github.io/express-restify-mongoose/ for querying the GET endpoints:

### Filtering
* https://gambit-conversations-staging.herokuapp.com/api/v1/messages?query={"platform":"slack"}
* https://gambit-conversations-staging.herokuapp.com/api/v1/messages?query={"createdAt":{"$gt":"2017-06-24T00:34:11.114Z"}}

### Sort
* https://gambit-conversations-staging.herokuapp.com/api/v1/messages?sort=-createdAt
