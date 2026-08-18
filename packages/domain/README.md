# 🏛 Domain Package

> The heart of Project Atlas. Pure business logic. Zero infrastructure dependencies.

## Purpose

The `domain` package contains all domain entities, value objects, business rules, and domain events for Project Atlas. This package knows **nothing** about:

- Supabase or any database
- OpenAI or any LLM provider
- FastAPI or any web framework
- React or any frontend framework

It only knows the **business**.

## Ownership

**Owner:** Lead Architect (design) + Backend Engineer (implementation)  
**Review required:** CTO sign-off for any breaking domain changes

## Package Structure

```
packages/domain/
├── entities/
│   ├── certification.py         # Certification, ExamBlueprint
│   ├── question.py              # Question, QuestionPool
│   ├── session.py               # ExamSession, TrainingSession
│   ├── learning.py              # MasteryProfile, LearningRecommendation
│   └── user_progress.py         # UserProgress, StudyObjective
├── value_objects/
│   ├── mastery_score.py         # MasteryScore (0.0–1.0)
│   ├── readiness_score.py       # ReadinessScore (0–100)
│   ├── question_difficulty.py   # QuestionDifficulty (enum)
│   └── exam_result.py           # ExamResult (passed/failed + score)
├── events/
│   ├── exam_events.py           # ExamStarted, ExamCompleted, AttemptSubmitted
│   ├── learning_events.py       # SessionStarted, MasteryUpdated
│   └── question_events.py       # QuestionGenerated, QuestionValidated
├── interfaces/
│   ├── repositories.py          # Abstract repository contracts
│   ├── question_factory.py      # QuestionFactory interface
│   └── learning_engine.py       # LearningEngine interface
├── exceptions/
│   └── domain_exceptions.py     # DomainException, ValidationError, etc.
└── __init__.py
```

## Core Entities

| Entity | Description |
|---|---|
| `Certification` | A Microsoft certification (e.g., AZ-900, AZ-104) |
| `StudyObjective` | A weighted exam objective within a certification |
| `Question` | An exam question with options, answer, and explanation |
| `QuestionPool` | A versioned collection of questions for a certification |
| `ExamBlueprint` | Defines structure: question count, pass score, time limit, distribution |
| `ExamSession` | An active or completed exam attempt |
| `TrainingSession` | A practice/learning session (not graded) |
| `MasteryProfile` | Per-user, per-certification mastery tracking |
| `LearningRecommendation` | AI-driven study recommendations |
| `UserProgress` | High-level progress tracking (streaks, averages) |

## Engineering Rules

1. **No imports from infrastructure** — no SQLAlchemy models, no HTTP clients, no Supabase
2. **All entities are immutable** — use dataclasses or Pydantic models with `frozen=True`
3. **Business rules live here** — not in services, not in controllers
4. **Domain events are raised here** — entities raise events, infrastructure handles them
5. **Interfaces are defined here** — implementations live in infrastructure

## Key Interfaces

### LearningEngine Interface
```python
class LearningEngineInterface(Protocol):
    def calculate_mastery(self, profile: MasteryProfile, attempt: AttemptResult) -> MasteryProfile: ...
    def get_recommendations(self, profile: MasteryProfile) -> list[LearningRecommendation]: ...
    def calculate_readiness(self, profile: MasteryProfile) -> ReadinessScore: ...
```

> ⚠️ The Learning Engine MUST be deterministic. Same inputs → same outputs. No LLMs allowed here.

### QuestionFactory Interface
```python
class QuestionFactoryInterface(Protocol):
    async def generate(self, objective: StudyObjective, difficulty: QuestionDifficulty) -> Question: ...
    async def validate(self, question: Question) -> ValidationResult: ...
```

## References

- [Architecture.md](../../knowledge/Architecture.md)
- [DomainModel.md](../../knowledge/DomainModel.md)
- [CodingStandards.md](../../knowledge/CodingStandards.md)
- [EngineeringConstitution.md](../../knowledge/EngineeringConstitution.md)
