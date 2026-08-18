# 📝 Exam Engine Package

> Deterministic exam generation, session management, and grading. PearsonVUE-quality reliability.

## Purpose

The `exam-engine` package handles the entire exam lifecycle:

1. **Blueprint-driven generation** — selecting questions according to the exam blueprint (objectives × weights)
2. **Session management** — starting, pausing, resuming, and submitting exam sessions
3. **Grading** — deterministic, auditable scoring
4. **Time management** — enforcing time limits, handling disconnections gracefully
5. **Result generation** — per-objective breakdowns, pass/fail determination

## Ownership

**Owner:** Backend Engineer (implementation) + Lead Architect (design)  
**Review required:** Security Engineer (session integrity), QA Engineer (grading accuracy)

## Package Structure

```
packages/exam-engine/
├── blueprint/
│   ├── generator.py             # Exam blueprint → question selection
│   ├── distributor.py           # Question distribution across objectives
│   └── validator.py             # Blueprint validation
├── session/
│   ├── manager.py               # Session lifecycle (create, pause, resume, submit)
│   ├── state_machine.py         # Session state: PENDING → ACTIVE → PAUSED → SUBMITTED → GRADED
│   ├── timer.py                 # Time limit enforcement
│   └── integrity.py             # Anti-cheating, session token validation
├── grading/
│   ├── grader.py                # Score calculation
│   ├── result_builder.py        # Build detailed ExamResult
│   └── pass_calculator.py       # Pass/fail determination per blueprint
├── analytics/
│   ├── performance_analyzer.py  # Per-objective performance analysis
│   └── comparison.py            # Compare against cohort benchmarks
└── __init__.py
```

## Session State Machine

```
PENDING ──────► ACTIVE ──────► SUBMITTED ──────► GRADED
                   │
                   ▼
                PAUSED ────────► ACTIVE
                   │
                   ▼
              ABANDONED (timeout)
```

## Grading Rules

- Score = (correct answers / total questions) × 100
- Pass threshold defined per `ExamBlueprint` (typically 700/1000 for Microsoft exams)
- All scoring is **integer arithmetic** — no floating point rounding issues
- Per-objective breakdown always included in results
- Results are **immutable** once generated

## Exam Integrity Requirements

- Each session has a cryptographically signed session token
- Question order is randomized **once** at session creation, then locked
- Answer modifications after submission are impossible (append-only log)
- Time remaining is server-side authoritative (never trust client clock)

## Engineering Rules

1. Grading is 100% deterministic — same answers → same score
2. No LLM calls during exam sessions
3. Session state transitions are atomic
4. All session events are logged for audit

## References

- [DomainModel.md](../../knowledge/DomainModel.md)
- [SecurityStandards.md](../../knowledge/SecurityStandards.md)
- [TestingStandards.md](../../knowledge/TestingStandards.md)
