# Coding Standards

## Python Standards (Backend)
- **Typing**: Type hints are mandatory everywhere. Run `mypy` in strict mode.
- **Async**: Use `async`/`await` for all I/O bound operations (database, API calls).
- **Models**: Use Pydantic V2 for all data validation and serialization.
- **Database**: No raw SQL in services or domain. Use the repository pattern.
- **Naming**: `snake_case` for variables and functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- **Imports**: Group imports: standard library, third-party, local first-party.

## React/Next.js Standards (Frontend)
- **TypeScript**: Strict TypeScript everywhere. No `any` types.
- **Components**: Functional components only. Use hooks.
- **State**: Use `Zustand` for global state. Keep React context minimal.
- **Hooks**: Do not abuse `useEffect`. Favor derived state and event handlers.
- **Naming**: `PascalCase` for components and files (`UserProfile.tsx`), `camelCase` for utilities.

## SQL & Database Standards
- **Naming**: `snake_case` for tables and columns.
- **Keys**: UUIDv4 for all Primary Keys.
- **Security**: Row Level Security (RLS) is REQUIRED on all tables in Supabase.
- **Performance**: Index all foreign keys and frequently queried columns.
- **Migrations**: Name migrations descriptively: `YYYYMMDD_HHMMSS_add_user_profile.sql`.

## General Guidelines
- **Function Length**: Maximum 50 lines. Extract logic into smaller functions.
- **File Length**: Maximum 300 lines. Split large files.
- **TODOs**: No `TODO` or `FIXME` comments allowed in the main branch. Track in Jira/Linear.
- **Error Handling**: Use custom exception classes. Never fail silently. Log exceptions with context.
