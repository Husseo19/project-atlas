# ADR-0004: Build LLM Provider Abstraction Layer

**Date**: 2026-07-24
**Status**: Accepted

## Context
We heavily rely on LLMs (OpenAI, Anthropic) for the Question Factory. The AI landscape moves rapidly, and frameworks like LangChain introduce significant abstraction bloat and lock-in.

## Decision
We will build our own lightweight LLM Provider Abstraction Layer instead of using heavy frameworks like LangChain or LlamaIndex as core dependencies.

## Reasons
1. **Framework Independence**: LangChain updates frequently break backward compatibility.
2. **Vendor Agnostic**: We can easily switch between GPT-4o, Claude 3.5, or open-source models based on cost/performance.
3. **Simplicity**: We only need prompt formatting, API calling, and JSON validation, which is easily handled by native clients + Pydantic.

## Consequences
- We have to maintain our own API wrappers and retry logic.
- We have full control and understanding of the AI orchestration pipeline.
