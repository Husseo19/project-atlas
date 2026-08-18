# Folder Structure

This is the canonical reference for the Project Atlas monorepo structure.

## Root Level
- `apps/` - Deployable applications (Frontend, Backend APIs).
- `packages/` - Internal libraries and core domain logic.
- `docs/` - Product documentation, ADRs, and roadmaps.
- `knowledge/` - Engineering handbook and standards.
- `prompts/` - Versioned LLM prompts.

## apps/web/
Next.js frontend application.
- `src/app/` - Next.js App Router pages and layouts.
- `src/components/` - Reusable UI components.
- `src/lib/` - Frontend utilities and API clients.
- `src/store/` - Zustand state stores.

## services/backend/
FastAPI application entrypoint.
- `api/` - API routers and endpoints.
- `core/` - Application configuration and dependencies.
- `main.py` - FastAPI application setup.

## packages/
- `domain/` - Core entities, value objects, and repository interfaces.
- `learning-engine/` - Deterministic scoring and mastery algorithms.
- `exam-engine/` - Session state management and exam blueprint logic.
- `question-factory/` - Content generation, LLM orchestration, and validation.
- `analytics-engine/` - Aggregation and reporting logic.
- `shared/` - Common utilities, logging, and error handling.

## Rules
- **Dependency Rule**: `apps` can import `packages`, but `packages` cannot import `apps`. `domain` cannot import any other package.
- **API Boundaries**: Packages should expose a clean public API (e.g., via `__init__.py`).
