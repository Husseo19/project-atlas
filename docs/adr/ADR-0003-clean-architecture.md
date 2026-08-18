# ADR-0003: Use Clean Architecture (Domain-Centric)

**Date**: 2026-07-24
**Status**: Accepted

## Context
We need an architectural pattern that supports long-term maintainability, testability, and the ability to swap out AI providers or databases as the technology landscape changes.

## Decision
We will implement Clean Architecture across our backend services, structuring code into Domain, Application, Infrastructure, and Presentation layers.

## Reasons
1. **Independence**: Business logic (Learning Engine, Scoring) is decoupled from external frameworks.
2. **Testability**: Pure domain functions can be tested instantly without mocks or databases.
3. **Flexibility**: We can swap OpenAI for Anthropic, or Supabase for standard Postgres, by only changing the Infrastructure layer.

## Consequences
- **More Boilerplate**: Requires defining interfaces and mapping models between layers.
- **Learning Curve**: Team members must understand the strict dependency rules (inward-facing dependencies only).
