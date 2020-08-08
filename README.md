....

users

- name
- createdAt
- updatedAt

emails

- user_id
- email
- createdAt
- updatedAt

```
curl -s \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"name":"Patrick", "emails":["preagan@tangogroup.com"]}' \
  "http://localhost:3000/users" | jq .
```

```json
{
  "id": 13,
  "name": "Patrick",
  "createdAt": "2020-07-15T05:26:53.000Z",
  "updatedAt": "2020-07-15T05:26:53.000Z",
  "emails": [
    {
      "id": 1,
      "email": "preagan@tangogroup.com"
    }
  ]
}
```

```
curl -s \
  -X PUT \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"name":"Patty Boi"}' \
  "http://localhost:3000/users/13" | jq .
```

```json
{
  "id": 13,
  "name": "Patty Boi",
  "createdAt": "2020-07-15T05:26:53.000Z",
  "updatedAt": "2020-07-15T05:28:42.000Z",
  "emails": [
    {
      "id": 1,
      "email": "preagan@tangogroup.com"
    }
  ]
}
```

```
curl -s \
  -X PUT \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"emails":[]}' \
  "http://localhost:3000/users/13" | jq .
```

```json
{
  "id": 13,
  "name": "Patty Boi",
  "createdAt": "2020-07-15T05:26:53.000Z",
  "updatedAt": "2020-07-15T05:28:42.000Z",
  "emails": []
}
```

```
curl -s \
  -X PUT \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"name":""}' \
  "http://localhost:3000/users/13" | jq .
```

```json
{
  "statusCode": 400,
  "message": ["name should not be empty"],
  "error": "Bad Request"
}
```

```
curl -s \
 -H "Accept: application/json" \
 -H "Content-Type: application/json" \
 "http://localhost:3000/users/1" | jq .

curl -s \
 -H "Accept: application/json" \
 -H "Content-Type: application/json" \
 -d '{"name":"Patrick"}' \
 "http://localhost:3000/users" | jq .

```

```

```
