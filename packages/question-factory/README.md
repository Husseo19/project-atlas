# 🏭 Question Factory Package

> AI-powered multi-stage question generation pipeline. Our most valuable asset — and the most complex.

## Purpose

The `question-factory` package is responsible for generating high-quality Microsoft certification exam questions using LLMs. It is a **pipeline** — not a single LLM call — with generation, validation, scoring, caching, and storage stages.

## Ownership

**Owner:** AI Platform Engineer  
**Review required:** Lead Architect (pipeline design), QA Engineer (validation quality), CTO (cost decisions)

## ⚠️ Core Principle

> "Can this LLM call be avoided?"  
> Every LLM call costs money and time. Questions are cached aggressively. Generation only happens when necessary.

## Package Structure

```
packages/question-factory/
├── generators/
│   ├── scenario_generator.py    # Scenario-based questions (most Microsoft exam questions)
│   ├── concept_generator.py     # Concept understanding questions
│   ├── command_generator.py     # CLI/PowerShell command questions
│   └── troubleshoot_generator.py # Troubleshooting scenario questions
├── validators/
│   ├── structural_validator.py  # JSON schema, required fields
│   ├── content_validator.py     # Accuracy, plausibility of distractors
│   ├── uniqueness_checker.py    # Similarity check against existing pool
│   └── difficulty_validator.py  # Verify intended difficulty level
├── explanations/
│   ├── generator.py             # Generate answer explanations
│   └── enricher.py              # Add references, links, context
├── routers/
│   ├── model_router.py          # Route to correct LLM provider based on task
│   └── fallback_router.py       # Fallback chain: OpenAI → Anthropic → cached
├── cache/
│   ├── question_cache.py        # Redis-based question cache
│   └── cache_policy.py          # Cache TTL and invalidation rules
├── prompts/
│   ├── scenario_v1.txt          # Prompt: scenario question generation
│   ├── validate_v1.txt          # Prompt: content validation
│   ├── explain_v1.txt           # Prompt: explanation generation
│   └── distractor_v1.txt        # Prompt: distractor generation
├── quality/
│   ├── scorer.py                # Multi-dimensional quality scoring
│   └── rubric.py                # Quality rubric definitions
└── __init__.py
```

## Generation Pipeline

```
StudyObjective + Difficulty
        │
        ▼
   [Check Cache] ──── Cache Hit ──────────────────────► Return Cached Question
        │
     Cache Miss
        │
        ▼
  [Model Router] ── select provider (OpenAI / Anthropic)
        │
        ▼
  [Generator] ── LLM generates question JSON
        │
        ▼
  [Structural Validator] ── validates JSON schema
        │ Fail ──► Retry (max 3)
        ▼
  [Content Validator] ── validates accuracy
        │ Fail ──► Discard + log
        ▼
  [Quality Scorer] ── scores 6 dimensions
        │ Score < 0.7 ──► Discard + log
        ▼
  [Uniqueness Checker] ── similarity against pool
        │ Too similar ──► Discard
        ▼
  [Explanation Generator] ── generate explanation
        │
        ▼
  [Cache] ── store in Redis
        │
        ▼
  [Return Question]
```

## Quality Scoring Dimensions

Each generated question is scored 0.0–1.0 on:

| Dimension | Description |
|---|---|
| **Accuracy** | Is the correct answer actually correct? |
| **Clarity** | Is the question unambiguous? |
| **Distractor Quality** | Are wrong answers plausible but clearly wrong? |
| **Difficulty Alignment** | Does it match the requested difficulty? |
| **Objective Alignment** | Does it test the right study objective? |
| **Explanation Quality** | Is the explanation educational and complete? |

Minimum composite score: **0.70** to be accepted.

## Cost Management

- All LLM calls are tracked with: provider, model, prompt_tokens, completion_tokens, cost_usd
- Cost alerts trigger at $10/day per user (BYO API key mode)
- Cache hit rate target: > 80% (generate once, serve many)
- Prefer GPT-4o-mini / Claude Haiku for validation; GPT-4o / Claude Sonnet for generation

## Prompt Versioning

All prompts are registered in [PROMPT_REGISTRY.md](../../prompts/PROMPT_REGISTRY.md).  
Never modify a prompt without incrementing its version.

## References

- [PromptStandards.md](../../knowledge/PromptStandards.md)
- [Architecture.md](../../knowledge/Architecture.md)
- [SecurityStandards.md](../../knowledge/SecurityStandards.md) (LLM security section)
