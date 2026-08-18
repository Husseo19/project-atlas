# 🧠 Learning Engine Package

> The competitive moat of Project Atlas. 100% deterministic. LLM-free. Scientifically grounded.

## Purpose

The `learning-engine` package implements all adaptive learning algorithms. It determines:

- What a user knows (mastery calculation)
- What they should study next (recommendations)
- Whether they are ready to take the exam (readiness scoring)
- How to remediate weak areas (remediation paths)

## ⚠️ Critical Engineering Rule

> **The Learning Engine is ALWAYS deterministic.**  
> Same inputs → same outputs. Every time. No exceptions.  
> LLMs are NEVER used to calculate mastery, readiness, or recommendations.  
> This is non-negotiable per the Engineering Constitution.

## Ownership

**Owner:** AI Platform Engineer (algorithms) + Backend Engineer (implementation)  
**Review required:** CTO sign-off for algorithm changes (create ADR)

## Package Structure

```
packages/learning-engine/
├── mastery/
│   ├── calculator.py            # Core mastery calculation algorithm
│   ├── decay.py                 # Knowledge decay over time
│   └── models.py                # Mastery data models
├── recommendations/
│   ├── engine.py                # Recommendation generation
│   ├── priority.py              # Objective prioritisation logic
│   └── models.py                # Recommendation models
├── remediation/
│   ├── paths.py                 # Remediation path generation
│   └── strategies.py            # Remediation strategy selection
├── readiness/
│   ├── scorer.py                # Exam readiness score (0–100)
│   ├── thresholds.py            # Readiness thresholds per certification
│   └── models.py                # Readiness models
├── analytics/
│   ├── aggregator.py            # Learning analytics aggregation
│   └── reports.py               # Progress reports
├── tests/
│   ├── test_mastery.py          # Must achieve 100% coverage
│   ├── test_recommendations.py
│   ├── test_readiness.py
│   └── fixtures/                # Known-good test scenarios
└── __init__.py
```

## Algorithm Overview

### Mastery Score (0.0 – 1.0)

Mastery is calculated per study objective using a **weighted moving average** with **temporal decay**:

```
mastery = (weighted_correct_rate × recency_factor) × objective_weight
```

- `weighted_correct_rate`: Recent attempts weighted 3× more than older attempts
- `recency_factor`: Exponential decay based on days since last attempt
- `objective_weight`: The certification blueprint weight for this objective

### Readiness Score (0 – 100)

```
readiness = Σ (objective_mastery × objective_weight) × confidence_factor
```

- Requires minimum 20 practice questions per objective before confident score
- Threshold for "exam ready": readiness ≥ 75

### Recommendation Priority

1. Objectives with mastery < 0.4 (critical weakness)
2. Objectives with mastery 0.4–0.6 (needs reinforcement)
3. Objectives approaching knowledge decay threshold
4. High-weight objectives not yet attempted

## Test Requirements

The Learning Engine has **special testing requirements** per the Engineering Constitution:

- **100% unit test coverage** — no exceptions
- **Determinism tests** — same inputs run 1,000× must produce identical outputs
- **Known-good scenario tests** — test with realistic user journeys
- **Edge cases** — zero attempts, single attempt, perfect score, complete failure

## References

- [DomainModel.md](../../knowledge/DomainModel.md)
- [Architecture.md](../../knowledge/Architecture.md)
- [TestingStandards.md](../../knowledge/TestingStandards.md)
- [EngineeringConstitution.md](../../knowledge/EngineeringConstitution.md)
