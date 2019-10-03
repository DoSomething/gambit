# Authentication

All routes are protected by Basic Auth, using config vars:
* `DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_NAME`
* `DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_PASS`

Requests should include an Authorization header.

#### Supplying basic auth headers

##### Manually using cURL
To do this you need to perform the following steps:

- Specify the user name and password to use for server authentication: `name:pass`
- Add as option in the cURL string: `-u 'name:pass'`

<details>
<summary><strong>Example</strong></summary>

```
curl -D -X POST "http://localhost:5100/api/v2/messages?origin=broadcast" \
    -H 'Content-Type: application/json' \
    -u 'name:pass' \
    -d $'{
      "northstarId": "5547be89429c64ec7e8b518d",
      "broadcastId": "4nwTwvXmfuuYAGYgusGyyW"
    }'
```
</details>

##### As part of the URL (Especially helpful for webhooks)
Prepend the `name` and `pass` in the form `name:pass@` to the endpoint URL.
```
http://name:pass@localhost:5100/api/v2/messages?origin=broadcast
```
