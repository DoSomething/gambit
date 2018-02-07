# Messages

```
POST /v2/messages
```

The v2 POST Messages resource is a work in progress, aiming to deprecate the v1 POST Receive, Import, and Send Message resources. A Message is created for each POST request, and handled differently per `origin` query parameter passed.

## Broadcast

```
POST /v2/messages?origin=broadcast
```

### Input

Name | Type | Description
--- | --- | ---
`northstarId` | `string` | User Id to send Broadcast message to
`broadcastId` | `string` | Broadcast Id to send

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=broadcast" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
  "northstarId": "5547be89429c64ec7e8b518d",
  "broadcastId": "5Akz30ejtKCsiWgwKIkOyo"
}'
```

</details>
<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": [
      {
        "_id": "5a5e9bb842ced115e4dbfda4",
        "updatedAt": "2018-01-17T00:41:28.911Z",
        "createdAt": "2018-01-17T00:41:28.911Z",
        "text": "Hi it's Freddie! Want to know how you could enter for the chance to win a $5K scholarship by sharing one of your big regrets? It takes 2 mins! Reply Yes or No",
        "direction": "outbound-api-send",
        "template": "askSignup",
        "conversationId": "5a2c391d36515819a6446d6e",
        "campaignId": 7978,
        "topic": "campaign",
        "broadcastId": "5Akz30ejtKCsiWgwKIkOyo",
        "__v": 0,
        "metadata": {
          "requestId": "17b1ab02-205b-4728-b4c9-d778bf89f561"
        },
        "attachments": []
      }
    ]
  }
```

</details>

## Front

### Input

See [Front docs](https://dev.frontapp.com/#sending-messages).


<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=front" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -H 'X-Front-Signature: secretsauce' \
     -u 'puppet:totallysecret' \
     -d $'{
  "_links": {
    "self": "https://api2.frontapp.com/messages/msg_55c8c149",
    "related": {
      "conversation": "https://api2.frontapp.com/conversations/cnv_55c8c149",
      "message_replied_to": "https://api2.frontapp.com/messages/msg_1ab23cd4"
    }
  },
  "id": "msg_55c8c149",
  "type": "custom",
  "is_inbound": false,
  "created_at": 1453770984.123,
  "blurb": "Anything less than immortality is a...",
  "recipients": [
    {
      "handle": "calculon@momsbot.com",
      "role": "to",
      "_links": {
        "related": {
          "contact": "https://api2.frontapp.com/contacts/crd_55c8c149"
        }
      }
    },
    {
      "handle": "puppet@puppetsloth.com",
      "role": "from",
      "_links": {
        "related": {
          "contact": "https://api2.frontapp.com/contacts/crd_55c8c149"
        }
      }
    }
  ],
  "body": "Anything less than immortality is a complete waste of time.",
  "text": "Anything less than immortality is a complete waste of time.",
  "attachments": [],
  "metadata": {}
}'
```


</details>
<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": [
      {
        "_id": "5a7b70f478225e00040c5f22",
        "updatedAt": "2018-02-07T21:34:44.382Z",
        "createdAt": "2018-02-07T21:34:44.382Z",
        "text": "Anything less than immortality is a complete waste of time.",
        "direction": "outbound-api-send",
        "template": "support",
        "conversationId": "59b0de57e9f1ae00126cd731",
        "campaignId": 2299,
        "agentId": "puppet@puppetsloth.com",
        "topic": "random",
        "broadcastId": null,
        "__v": 0,
        "metadata": {
          "requestId": "333d0a65-ee7a-4d62-b815-336495628bca"
        },
        "attachments": []
      }
    ]
  }
```

</details>


## Signup

```
POST /v2/messages?origin=signup
```

### Input

Name | Type | Description
--- | --- | ---
`northstarId` | `string` | User Id to send externalSignupMenuMessage to
`campaignId` | `string` | Campaign Id to send externalSignupMenuMessage for

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=signup" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
  "northstarId": "5547be89429c64ec7e8b518d",
  "campaignId": "2299"
}'
```


</details>
<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": [
      {
        "_id": "5a7b70f478225e00040c5f22",
        "updatedAt": "2018-02-07T21:34:44.382Z",
        "createdAt": "2018-02-07T21:34:44.382Z",
        "text": "Hey - this is Freddie from DoSomething. Thanks for joining Two Books Blue Books!\n\nIn some low-income neighborhoods, there is only one book for every 300 children.\n\nThe solution is simple: Host a Dr. Seuss book drive to benefit kids in family shelters.\n\nMake sure to take a photo of what you did! When you have Collected some Books, text START to share your photo.",
        "direction": "outbound-api-send",
        "template": "externalSignupMenu",
        "conversationId": "59b0de57e9f1ae00126cd731",
        "campaignId": 2299,
        "topic": "campaign",
        "broadcastId": null,
        "__v": 0,
        "metadata": {
            "requestId": "333d0a65-ee7a-4d62-b815-336495628bca"
        },
        "attachments": []
      }
    ]
  }
```

</details>
