# API Standards

## URL Conventions
- Use plural nouns for resources (e.g., `/users`, `/exams`).
- Use `kebab-case` for multi-word segments (e.g., `/study-sessions`).
- All APIs must be versioned (e.g., `/api/v1/certifications`).

## HTTP Methods
- `GET`: Retrieve a resource or collection.
- `POST`: Create a new resource or execute an action.
- `PUT`: Replace an existing resource entirely.
- `PATCH`: Partially update an existing resource.
- `DELETE`: Remove a resource.

## Request/Response Formats
- Always use `application/json`.
- Standard success response:
  ```json
  {
    "data": { ... },
    "meta": { "page": 1, "total": 50 } // if applicable
  }
  ```

## Error Format
All errors must follow this structure:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided.",
    "details": ["Field 'email' must be a valid email address."],
    "traceId": "req-12345-abcde"
  }
}
```

## Authentication & Security
- Use Bearer JWT in the `Authorization` header.
- Implement rate limiting headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`).
- Paginate collection endpoints using `limit` and `offset` (or cursor-based).

## Documentation
- All endpoints must be documented using OpenAPI (Swagger).
- Include descriptions, examples, and all possible error responses.
