# Security Standards

## Zero-Trust Principles
- Never trust client inputs. Always validate on the backend.
- Authenticate and authorize every request, even internal service-to-service calls.
- Least privilege access for all roles and database connections.

## Authentication & Authorization
- **Auth**: Use JWT (RS256) via Supabase Auth. Employ short-lived access tokens and secure refresh tokens.
- **Authorization**: Enforce Role-Based Access Control (RBAC) in the application layer.
- **RLS**: Row Level Security is mandatory on all Supabase tables to prevent unauthorized data access at the database level.

## Input Validation
- Validate all incoming data against strict Pydantic schemas.
- Sanitize HTML/Markdown inputs to prevent XSS on the frontend.

## OWASP Top 10 Application
- **Injection**: Prevented via SQLAlchemy/ORM and strict type casting.
- **Broken Auth**: Handled by Supabase Auth.
- **Sensitive Data Exposure**: Encrypt PII at rest. Enforce TLS 1.2+ for all transit.

## LLM Security
- **Prompt Injection**: Use clear delimiters (e.g., XML tags) to separate instructions from user input.
- **Output Sanitization**: Treat LLM output as untrusted user input. Validate and sanitize before rendering or storing.

## Secrets Management
- No secrets in the codebase.
- Use environment variables (`.env` for local, secret manager for production).

## Audit Logging
- Log all significant security events (logins, permission changes, key creations) with user IDs and timestamps.
