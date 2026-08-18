# 📦 Shared Package

> Cross-cutting concerns. Types shared across packages. The LLM Provider Abstraction Layer.

## Purpose

The `shared` package contains:

- **Common types and interfaces** — used across all packages
- **LLM Provider Abstraction Layer** — the single interface to all AI providers
- **Shared schemas** — Pydantic models used by multiple packages
- **Constants** — certification codes, difficulty levels, system-wide configuration
- **Utilities** — date helpers, ID generation, validation helpers

## Ownership

**Owner:** Lead Architect (design) — changes require architecture review  
**Implementation:** Backend Engineer

## ⚠️ Import Rule

> Packages may import FROM `shared`.  
> `shared` may NEVER import FROM other packages.  
> Circular dependencies are forbidden.

## Package Structure

```
packages/shared/
├── llm/
│   ├── base.py                  # LLMProvider abstract interface
│   ├── openai.py                # OpenAI implementation
│   ├── anthropic.py             # Anthropic implementation
│   ├── gemini.py                # Google Gemini implementation
│   ├── ollama.py                # Ollama (local) implementation
│   ├── router.py                # Provider selection and routing
│   └── models.py                # LLMRequest, LLMResponse, TokenUsage
├── schemas/
│   ├── question.py              # Shared Question schemas
│   ├── user.py                  # Shared User schemas
│   ├── pagination.py            # Standard pagination schemas
│   └── errors.py                # Standard error response schemas
├── types/
│   ├── identifiers.py           # UserID, CertificationID, QuestionID types
│   ├── enums.py                 # QuestionDifficulty, SessionStatus, etc.
│   └── primitives.py            # MasteryScore, ReadinessScore value objects
├── constants/
│   ├── certifications.py        # Microsoft certification codes and names
│   ├── limits.py                # System limits (max questions, timeouts)
│   └── messages.py              # Standard system messages
├── utils/
│   ├── ids.py                   # UUID generation
│   ├── dates.py                 # Date arithmetic
│   ├── hashing.py               # Secure hashing utilities
│   └── retry.py                 # Retry decorator with exponential backoff
└── __init__.py
```

## LLM Provider Abstraction Layer

This is one of the most important architectural decisions in Project Atlas (see ADR-0004).

### Interface Design

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class LLMRequest:
    prompt: str
    system_prompt: str
    max_tokens: int
    temperature: float
    model: str | None = None  # Override if needed

@dataclass
class LLMResponse:
    content: str
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    cost_usd: float
    latency_ms: int

class LLMProvider(ABC):
    @abstractmethod
    async def complete(self, request: LLMRequest) -> LLMResponse: ...

    @abstractmethod
    async def health_check(self) -> bool: ...

    @property
    @abstractmethod
    def name(self) -> str: ...
```

### Provider Implementations

| Provider | Class | Notes |
|---|---|---|
| OpenAI | `OpenAIProvider` | Default for generation |
| Anthropic | `AnthropicProvider` | Alternative, excellent for explanation |
| Google Gemini | `GeminiProvider` | Future roadmap |
| Ollama | `OllamaProvider` | Local development only |

### Routing Rules

```python
# In model_router.py
GENERATION_PROVIDER = "openai"        # GPT-4o for question generation
VALIDATION_PROVIDER = "anthropic"     # Claude for validation (cross-check)
EXPLANATION_PROVIDER = "openai"       # GPT-4o-mini for explanations (cost-efficient)
FALLBACK_PROVIDER = "anthropic"       # If primary is unavailable
```

## Supported Certifications (Initial)

| Code | Name | Level |
|---|---|---|
| `AZ-900` | Microsoft Azure Fundamentals | Fundamental |
| `AZ-104` | Microsoft Azure Administrator | Associate |
| `AZ-305` | Designing Microsoft Azure Infrastructure Solutions | Expert |
| `SC-900` | Microsoft Security, Compliance, and Identity Fundamentals | Fundamental |

## References

- [Architecture.md](../../knowledge/Architecture.md)
- [CodingStandards.md](../../knowledge/CodingStandards.md)
- [ADR-0004-provider-abstraction.md](../../docs/adr/ADR-0004-provider-abstraction.md)
