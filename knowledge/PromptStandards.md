# LLM Prompt Standards

## Prompt Versioning
All prompts must be versioned and stored in the `prompts/` directory or registry.
Format: `[PROMPT_ID]_v[VERSION]` (e.g., `QUESTION_GENERATE_v1`).

## Required Sections
Every prompt must include:
1. **Role**: Define the persona (e.g., "You are an expert Azure Cloud Architect...").
2. **Context**: Provide background information.
3. **Instructions**: Clear, step-by-step tasks.
4. **Constraints**: What the LLM must NOT do.
5. **Output Format**: Exact JSON schema or markdown structure expected.
6. **Examples (Few-Shot)**: Provide at least one positive and one negative example.

## Anti-Patterns
- **Vagueness**: "Write a good question." (Use objective criteria instead).
- **Implicit Formatting**: Assuming the LLM will output JSON without explicit instructions.
- **Overloading**: Asking the LLM to generate, format, and evaluate in a single prompt. Split tasks.

## Guidelines
- **Token Budget**: Keep prompts concise to reduce latency and cost.
- **Temperature**: 
  - `0.0 - 0.2` for classification, extraction, and validation.
  - `0.5 - 0.7` for question generation and explanation drafting.
- **Validation**: All AI outputs MUST be validated using Pydantic before being stored or presented to the user.

## Registry Process
New prompts must be added to `prompts/PROMPT_REGISTRY.md` and reviewed by the AI Engineering lead before merging.
