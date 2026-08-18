# Decision Log

This log tracks major architectural and product decisions for Project Atlas.

| ID | Decision | Date | Reason | Consequences | ADR Link |
|---|---|---|---|---|---|
| 1 | Microsoft-first focus | 2026-07-24 | Large market, clear exam blueprints, high demand. | Postpones AWS/GCP support. | [ADR-0002](../docs/adr/ADR-0002-microsoft-first.md) |
| 2 | Clean Architecture | 2026-07-24 | Isolates business logic from infrastructure. | Slight initial overhead in boilerplate. | [ADR-0003](../docs/adr/ADR-0003-clean-architecture.md) |
| 3 | Supabase for Auth & DB | 2026-07-24 | Fast MVP development, native PostgreSQL, RLS security. | Vendor coupling to Supabase ecosystem. | [ADR-0001](../docs/adr/ADR-0001-use-supabase.md) |
| 4 | FastAPI for Backend | 2026-07-24 | Native async, Pydantic integration, fast performance. | Python ecosystem instead of Node.js. | N/A |
| 5 | Next.js for Frontend | 2026-07-24 | Industry standard, App router, good performance. | Requires React expertise. | N/A |
| 6 | LLM Provider Abstraction | 2026-07-24 | Avoid LangChain lock-in, easier to swap models. | Must build our own orchestration. | [ADR-0004](../docs/adr/ADR-0004-provider-abstraction.md) |
| 7 | Own business logic, rent AI | 2026-07-24 | AI is infrastructure, not the product core. | Requires building robust deterministic engines. | N/A |
| 8 | Deterministic Learning Engine | 2026-07-24 | LLMs are too unreliable for scoring and mastery calculation. | Must build complex algorithms manually. | N/A |
| 9 | Package-based Monorepo | 2026-07-24 | Easy code sharing across backend boundaries. | Tooling setup requires more care. | N/A |
