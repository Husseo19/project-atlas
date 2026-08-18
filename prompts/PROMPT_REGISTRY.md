# Prompt Registry

This registry tracks all active LLM prompts used in the Question Factory and AI features.

## Format
Prompts should be stored in this directory as `[ID]_v[VERSION].txt` or `.md`.

## Active Prompts

| ID | Name | Version | Owner | Use Case | Status |
|---|---|---|---|---|---|
| Q_GEN_SCENARIO | QUESTION_GENERATE_SCENARIO | v1 | AI Eng | Generates a scenario-based question from an objective. | Active |
| Q_VAL | QUESTION_VALIDATE | v1 | AI Eng | Validates the accuracy and difficulty of a generated question. | Active |
| Q_EXP | QUESTION_EXPLAIN | v1 | AI Eng | Generates detailed explanations for correct and incorrect answers. | Active |
| Q_DISTRACT | QUESTION_DISTRACTOR | v1 | AI Eng | Generates plausible but incorrect distractor options. | Active |

## Adding New Prompts
1. Draft the prompt following `PromptStandards.md`.
2. Test in the playground against at least 20 samples.
3. Add the prompt file to this directory.
4. Update this registry table.
5. Open a PR for review.

## Deprecation Process
When a prompt is replaced, update its status to `Deprecated`, keep the file for historical reference, and update the application code to use the new version.
