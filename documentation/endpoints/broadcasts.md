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
        "id": "1S4pnWcZ3qeK0IyU6u4gYE",
        "name": "Sprint Demo Broadcast",
        "createdAt": "2018-02-22T21:17:30.874Z",
        "updatedAt": "2018-02-22T22:32:37.505Z",
        "message": "Hi {{user.first_name}}!\n\nThis is the demo. Do you accept?",
        "topic": "survey_response",
        "campaignId": "2299",
        "template": "rivescript",
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
