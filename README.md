# 🎓 Project Atlas — AI Educator Platform

> An adaptive, AI-powered educational platform delivering personalized learning paths, intelligent assessment generation, and mastery-based progression for high-stakes examination preparation.

---

## Overview

Project Atlas is built on a **Modular Monolith** architecture, designed for seamless extraction into independent microservices as scale demands. Seven DDD Bounded Contexts each own their schema, domain logic, and deployment boundary. The platform serves learners preparing for high-stakes exams with a PearsonVUE-quality examination interface backed by deterministic mastery tracking and an AI-powered question generation pipeline.

---

## Engineering Priority Hierarchy

When requirements conflict, resolve using this fixed order — no exceptions:

| Priority | Principle | Rationale |
|:---:|---|---|
| 1 | **User Trust** | Learners entrust us with their education and personal data |
| 2 | **Learning Quality** | Educational outcomes are the product |
| 3 | **Maintainability** | Future engineers must change the system confidently |
| 4 | **Scalability** | Design for growth; do not premature-optimize |
| 5 | **Security** | Zero-trust posture throughout — no exceptions |
| 6 | **Performance** | Measurable and optimized, never speculative |
| 7 | **Cost** | Thoughtful cost management, never at the expense of the above |

---

## Repository Structure

```
project-atlas/
├── apps/
│   └── web/                    # React/Next.js frontend (PearsonVUE-style exam UI)
│       ├── public/
│       └── src/
│           ├── components/     # Atomic → Molecular → Organism hierarchy
│           ├── hooks/          # Custom React hooks
│           ├── pages/          # Route-level page components
│           ├── styles/         # Design system & global CSS
│           └── utils/          # Frontend utilities
├── services/
│   └── backend/                # FastAPI modular monolith
│       └── src/
│           ├── config/         # App configuration (Pydantic BaseSettings)
│           ├── controllers/    # Thin HTTP routers — ZERO business logic
│           ├── middleware/     # Auth, CORS, rate limiting, logging
│           ├── models/         # SQLAlchemy ORM models
│           └── routes/         # Route registration & OpenAPI tags
├── packages/
│   ├── ai-engine/              # LLM abstraction, provider routing, token budgets
│   ├── learning-engine/        # 100% deterministic adaptive learning algorithms
│   ├── exam-engine/            # Exam generation & grading state machine
│   ├── question-factory/       # AI-powered multi-stage question generation pipeline
│   ├── analytics/              # Event tracking, metrics aggregation, reporting
│   └── shared/                 # Centralized types, schemas, interfaces, constants
├── prompts/                    # Versioned AI prompt registry
├── docs/
│   ├── engineering/            # Technical documentation
│   │   └── decisions/          # Architectural Decision Records (ADRs)
│   ├── knowledge/              # Domain and educational knowledge base
│   └── standards/              # Engineering standards & process guides
├── infrastructure/
│   ├── docker/                 # Container definitions
│   ├── k8s/                    # Kubernetes manifests
│   ├── terraform/              # Infrastructure as code
│   └── ci-cd/                  # CI/CD pipeline definitions
├── scripts/                    # Developer & operational scripts
├── templates/                  # Code generation templates
├── README.md                   # This file
└── CHANGELOG.md                # Project version history
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React, Next.js, Zustand | Exam UI, adaptive learning interface |
| **Backend** | FastAPI, SQLAlchemy, Python (async/await) | API gateway, business logic orchestration |
| **Relational DB** | PostgreSQL (schema-per-bounded-context) | Persistent domain data |
| **Cache / Queue** | Redis | Sessions, token denylist, event streams |
| **Analytics Store** | ClickHouse / BigQuery | High-volume learner event analytics |
| **Blob Storage** | S3 / GCS | Media assets, exam exports |
| **AI Orchestration** | LangChain / LangGraph | Multi-stage AI pipelines |
| **Auth** | JWT RS256 + Redis denylist | Stateless auth with instant revocation |
| **Infrastructure** | Docker, Kubernetes, Terraform | Container orchestration & IaC |
| **Event Bus** | Redis Streams / BullMQ | Async, decoupled domain event processing |

---

## Bounded Contexts

| # | Context | Responsibility | Domain Entities |
|---|---|---|---|
| 1 | **Identity** | Auth, IAM, user lifecycle | User, Role, Session, Token, Permission |
| 2 | **Catalogue** | Course content metadata | Course, Module, Topic, Tag, Media |
| 3 | **Enrolment** | Student registrations & progress | Enrolment, Progress Snapshot, Completion |
| 4 | **Learning Engine** | Adaptive learning sessions | Session, Explanation, Hint, Learning Path |
| 5 | **Assessment Engine** | Questions, exams, grading | Question, Exam, Attempt, Grade, Evaluation |
| 6 | **Analytics** | Event tracking & reporting | Event, Metric, Report, Dashboard |
| 7 | **AI Gateway** | LLM abstraction & routing | Provider, Route, Token Budget, Cache, Log |

---

## Domain Events

| Event | Producer | Consumers |
|---|---|---|
| `user.registered` | Identity | Analytics, Enrolment |
| `course.enrolled` | Enrolment | Analytics, Learning Engine |
| `session.started` | Learning Engine | Analytics |
| `session.completed` | Learning Engine | Analytics, Enrolment |
| `question.generated` | Question Factory | Exam Engine, Analytics |
| `attempt.submitted` | Assessment Engine | Analytics, Learning Engine |
| `attempt.graded` | Assessment Engine | Analytics, Learning Engine, Enrolment |
| `report.generated` | Analytics | — |

---

## Documentation Index

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/engineering/ARCHITECTURE.md) | System design, bounded contexts, data flow, protocols |
| [API.md](docs/engineering/API.md) | REST API reference, auth flow, error codes, conventions |
| [DATABASE.md](docs/engineering/DATABASE.md) | Schema design, indexing strategy, RLS, migration standards |
| [AI_PIPELINE.md](docs/engineering/AI_PIPELINE.md) | Prompt versioning, pipeline stages, LLM routing, caching |
| [LEARNING_ENGINE.md](docs/engineering/LEARNING_ENGINE.md) | Mastery algorithm design, adaptive learning, determinism guarantee |
| [Decision Log](docs/engineering/decisions/) | ADR-001 through ADR-007 — every significant architectural decision |
| [SECURITY.md](docs/standards/SECURITY.md) | Zero-trust standards, auth, encryption, LLM security (OWASP) |
| [TESTING.md](docs/standards/TESTING.md) | QA philosophy, test types, edge case standards, approval criteria |
| [CONTRIBUTING.md](docs/standards/CONTRIBUTING.md) | Branching strategy, PR process, documentation requirements |
| [CODING_STANDARDS.md](docs/standards/CODING_STANDARDS.md) | Python, React, SQL coding conventions and enforcement |
| [PROMPT_REGISTRY.md](prompts/PROMPT_REGISTRY.md) | Versioned catalog of all AI prompts |
| [CHANGELOG.md](CHANGELOG.md) | Project version history |

---

## Engineering Constitution

These are non-negotiable. All contributors — regardless of seniority — uphold them:

1. **Documentation ships with code.** A feature without documentation is incomplete. The PR is not merged without it.
2. **AI assists; it never owns.** All business logic lives in the application layer. LLMs are I/O tools only.
3. **Zero-trust by default.** Assume hostile users. Trust nothing. Validate everything. Fail closed.
4. **The Learning Engine is deterministic.** Never use an LLM to calculate mastery, readiness, or scores.
5. **Correct ≠ Robust.** Happy path tests are not acceptance. Every feature must be proven robust under edge cases.
6. **Schema changes are migrations.** Never mutate production schemas manually. Every change is versioned.
7. **No secrets in code.** All credentials via Vault / environment variables. Zero exceptions.
8. **Composition over duplication.** Reuse components and services; never copy-paste domain logic.
