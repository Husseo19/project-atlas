# System Architecture

## Architecture Pattern
Project Atlas uses **Clean Architecture** (domain-centric). This ensures our core business logic is independent of UI, databases, and external APIs.

## The 4 Layers
1. **Domain Layer**: Contains enterprise logic, entities, and core types (e.g., Certification, Question, MasteryProfile). No external dependencies.
2. **Application Layer**: Contains use cases and business rules (e.g., StartExamSession, SubmitAnswer). Depends only on the Domain Layer.
3. **Infrastructure Layer**: Implementations of interfaces defined in the Application Layer (e.g., Supabase repositories, LLM provider clients).
4. **Presentation Layer**: The entry points to the system (e.g., FastAPI endpoints, Next.js UI).

## Package Structure
- `apps/web/`: Next.js frontend frontend.
- `services/backend/`: FastAPI backend entrypoints and routing.
- `packages/domain/`: Core entities and types.
- `packages/learning-engine/`: Deterministic mastery and scoring algorithms.
- `packages/exam-engine/`: Session management and exam simulation.
- `packages/question-factory/`: AI question generation and validation pipelines.
- `packages/analytics-engine/`: Progress tracking and reporting.
- `packages/shared/`: Cross-cutting utilities (logging, config).

## Key Architectural Decisions
- **Monorepo**: Package-based monorepo for seamless sharing between backend services and future scalability.
- **Supabase**: Used for Auth and PostgreSQL database, providing rapid MVP development while retaining RLS security.
- **LLM Provider Abstraction Layer**: We wrap OpenAI/Anthropic APIs in our own interfaces. We do not use LangChain as a core dependency, preventing vendor lock-in and excessive complexity.

## Technology Stack Summary
- **Frontend**: React, Next.js, TypeScript, Zustand, TailwindCSS (if applicable).
- **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy/Supabase Client.
- **Database**: PostgreSQL (via Supabase).
- **AI**: OpenAI (GPT-4o) and Anthropic (Claude 3.5 Sonnet) via custom abstraction.
