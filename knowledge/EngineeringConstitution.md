# Engineering Constitution

## Core Rules (Non-Negotiable)

1. **Documentation ships with code**: No PR is complete without updated documentation.
2. **AI assists; it never owns**: AI tools are accelerators, not decision-makers. Engineers own the output.
3. **Zero-trust by default**: All inputs must be validated, and all requests must be authenticated and authorized.
4. **Learning Engine is deterministic**: We never use LLMs for scoring or assessing readiness—only deterministic algorithms.
5. **Correct ≠ Robust**: A feature that works on the happy path is correct; a feature that handles the unhappy path is robust. We demand robustness.
6. **Schema changes are migrations**: Never modify the database schema directly. All changes must go through versioned migrations.
7. **No secrets in code**: Never commit API keys, passwords, or tokens. Use environment variables and secret managers.
8. **Composition over duplication**: Favor reusable, single-purpose components and functions over copying code.
9. **We own business logic — we rent the AI**: Our core value is the domain model and learning engine. AI providers are interchangeable infrastructure.
10. **Measure before optimizing**: Do not guess at performance bottlenecks. Use data and profiling.
11. **Keep it simple**: Simplicity over Cleverness. Code is read far more often than it is written.
12. **Leave it better than you found it**: Continuous Improvement applies to the codebase. Fix broken windows when you see them.

## Rule Conflicts (Priority Order)
When rules conflict, resolve them using this priority:
1. Security & Zero-Trust
2. Correctness & Determinism
3. Maintainability & Simplicity
4. Performance & Speed

## Adding New Rules
New rules are introduced via the ADR (Architecture Decision Record) process. The team must review and agree on the impact before modifying this Constitution.

## Enforcement
The Constitution is enforced through code reviews, automated CI/CD checks, and pairing sessions. Violations are treated as blocking issues on PRs.
