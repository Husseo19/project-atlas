# 📊 Analytics Engine Package

> Event-driven learner analytics. Every meaningful action is an event. Every event informs the platform.

## Purpose

The `analytics-engine` package handles:

- **Event tracking** — capturing all learner and system events
- **Metrics aggregation** — rolling up raw events into useful metrics
- **Reporting** — per-user, per-cohort, and platform-wide reports
- **Dashboard data** — serving the analytics dashboard
- **Cost tracking** — LLM usage and cost per user

## Ownership

**Owner:** Backend Engineer (implementation) + AI Platform Engineer (cost tracking)  
**Data governance review:** CTO (for any PII handling decisions)

## Package Structure

```
packages/analytics-engine/
├── events/
│   ├── event_types.py           # All event type definitions (enum)
│   ├── event_bus.py             # Event publishing (Redis Streams)
│   └── event_store.py           # Append-only event log
├── aggregators/
│   ├── session_aggregator.py    # Aggregate exam/training session metrics
│   ├── mastery_aggregator.py    # Roll up mastery over time
│   ├── cohort_aggregator.py     # Compare user against cohort
│   └── cost_aggregator.py       # LLM cost per user
├── reports/
│   ├── progress_report.py       # Individual learner progress
│   ├── readiness_report.py      # Exam readiness breakdown
│   ├── performance_report.py    # Historical performance trends
│   └── platform_report.py       # Admin platform-wide metrics
├── metrics/
│   ├── calculator.py            # Core metrics calculations
│   └── definitions.py           # Metric definitions and formulas
└── __init__.py
```

## Event Taxonomy

| Event | Producer | Data |
|---|---|---|
| `user.registered` | Identity | userId, timestamp, source |
| `certification.selected` | Enrolment | userId, certificationId |
| `exam.started` | Exam Engine | userId, sessionId, blueprintId |
| `exam.submitted` | Exam Engine | userId, sessionId, score, passed |
| `training.started` | Learning Engine | userId, sessionId, objectiveId |
| `training.completed` | Learning Engine | userId, sessionId, questionsAttempted |
| `question.answered` | Exam/Training | userId, questionId, correct, timeMs |
| `mastery.updated` | Learning Engine | userId, objectiveId, oldMastery, newMastery |
| `question.generated` | Question Factory | provider, model, cost, questionId |
| `readiness.calculated` | Learning Engine | userId, certificationId, score |

## Key Metrics

| Metric | Formula |
|---|---|
| Exam Pass Rate | passed_exams / total_exam_attempts |
| Average Mastery Growth | Δmastery per study hour |
| Question Accuracy Rate | correct / total per objective |
| Study Streak | Consecutive days with activity |
| LLM Cost per User | Σ(question_generation_costs) per userId |
| Cache Hit Rate | cached_served / total_questions_served |
| Time to Readiness | Days from enrollment to readiness ≥ 75 |

## Privacy Rules

- Events are append-only — never modified after write
- PII fields (email, name) are never included in events — use userId only
- Events older than 2 years are archived, not deleted (audit requirement)
- GDPR deletion = anonymize userId in event store, delete user record

## References

- [DomainModel.md](../../knowledge/DomainModel.md)
- [SecurityStandards.md](../../knowledge/SecurityStandards.md)
- [Architecture.md](../../knowledge/Architecture.md)
