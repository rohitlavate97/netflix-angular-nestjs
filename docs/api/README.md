# API Design & Conventions

All endpoints follow RESTful conventions under `/api/v1/`.

## Response Envelopes

### Success Envelope

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested item was not found",
    "details": []
  }
}
```

## Interactive Documentation

Swagger/OpenAPI UI is available at:
`http://localhost:3000/api/docs`
