# Broadcasts

```
GET /api/v1/broadcasts/:broadcastId
```
Retrieves a [Broadcast](https://github.com/DoSomething/gambit-admin/wiki/Broadcasts).


## Examples

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "GET" "http://localhost:5100/api/v1/broadcasts/1S4pnWcZ3qeK0IyU6u4gYE" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ="
```
</details>

<details>
<summary><strong>Example Response</strong></summary>

```
{
    "data": {
        "id": "257eBFFXnay6QoUOCuuiS0",
        "name": "GrabTheMic2018_Jul3_Pending_FINAL",
        "createdAt": "2018-07-04T13:24:32.793Z",
        "updatedAt": "2018-07-05T13:34:50.370Z",
        "message": {
          "text": "It's Freddie, happy 5th of July! Even though the holiday's over, you can still enjoy this playlist we made you all summer. Enjoy: https://www.dosomething.org/us/fourth-of-july-playlist?user_id={{user.id}}&broadcastid=257eBFFXnay6QoUOCuuiS0",
          "attachments": [
            
          ],
          "template": "rivescript"
        },
        "campaignId": null,
        "topic": "survey_response",
        "webhook": {
            "headers": {
                "Content-Type": "application/json"
            },
            "url": "http://<secret>:<secret>@localhost:5050/api/v1/webhooks/customerio-gambit-broadcast",
            "body": {
                "northstarId": "{{customer.id}}",
                "broadcastId": "1S4pnWcZ3qeK0IyU6u4gYE"
            }
        },,
        "stats": {
            "outbound": {
                "total": 2
            },
            "inbound": {
                "total": 2,
                "macros": {}
            }
        }
    }
}
```
</details>
