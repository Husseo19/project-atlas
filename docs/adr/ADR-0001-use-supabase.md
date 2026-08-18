# ADR-0001: Use Supabase for Database and Authentication

**Date**: 2026-07-24
**Status**: Accepted

## Context
Project Atlas needs a reliable, secure, and fast-to-develop database and authentication solution for the MVP. We need relational data modeling for complex learning domains.

## Decision
We will use Supabase as our primary PostgreSQL database and Authentication provider.

## Alternatives Considered
- **Firebase**: Rejected because NoSQL is a poor fit for our highly relational domain model (Certifications -> Objectives -> Questions).
- **Auth0 + Neon**: Rejected due to integration overhead for an MVP.
- **Self-hosted PostgreSQL**: Rejected due to operational burden.

## Reasons
1. **PostgreSQL**: Industry standard, powerful relational capabilities.
2. **Row Level Security (RLS)**: Built-in security at the database layer.
3. **Speed to Market**: Provides Auth, DB, and APIs out of the box.
4. **Scalability**: Can scale sufficiently for our projected user base.

## Consequences
- **Vendor Coupling**: We are somewhat coupled to the Supabase client libraries and Auth flow. We will mitigate this using Clean Architecture repository patterns.
- **Faster Delivery**: We save weeks of infrastructure setup.
