# Common Features

- domain: prompt
- '이름' 등과 같은 param은 한글이 포함될 수 있다.

# API Features

## 템플릿 프롬프트 생성

POST
/api/template-prompts
Create a new template prompt

Request body
```json
{
  "name": "string",
  "promptContent": "string"
}
```

Responses
201
```json
{
  "id": 0,
  "name": "string",
  "promptContent": "string",
  "createdAt": "2025-06-17T12:50:29.164Z",
  "createdId": "string",
  "updatedAt": "2025-06-17T12:50:29.164Z",
  "updatedId": "string"
}
```
