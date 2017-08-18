# Authentication

The `receive-message`, `import-message`, and `send-message` routes are protected by Basic Auth, using config vars:
* `'DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_NAME'`
* `'DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_PASS'`

Requests should include an Authorization header.

#### Supplying basic auth headers [(Source)](https://developer.atlassian.com/cloud/jira/platform/jira-rest-api-basic-authentication/#supplying-basic-auth-headers)

##### Manually
To do this you need to perform the following steps:

- Build a string of the form `name:pass`
- Base64 encode the string
- Supply an “Authorization” header with content “Basic ” followed by the encoded string. For example, the string `fred:fred` encodes to `ZnJlZDpmcmVk` in base64, so you would make the request as follows.
```
curl -D -X POST -H "Authorization: Basic ZnJlZDpmcmVk" -H "Content-Type: application/json" "http://localhost:5100/api/v1/import-message"
```

##### As part of the URL (Especially helpful for webhooks)
Prepend the `name` and `pass` in the form `name:pass@` to the endpoint URL.
```
http://name:pass@localhost:5100/api/v1/import-message
```
