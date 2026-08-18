# Definition of Done

A feature, task, or bug fix is considered "DONE" only when ALL of the following conditions are met:

## Code & Quality
- [ ] Code is written and adheres to `CodingStandards.md`.
- [ ] No `TODO`, `FIXME`, or commented-out code is left in the changes.
- [ ] No `console.log` or `print` statements remain (use proper logging).
- [ ] Performance impact has been considered and reviewed.

## Testing
- [ ] Unit and integration tests are written and pass.
- [ ] Test coverage meets or exceeds the required thresholds (100% for domain/engine, 80% global).
- [ ] CI pipeline is green.

## Documentation
- [ ] Code is appropriately commented (especially complex logic).
- [ ] `CHANGELOG.md` is updated.
- [ ] API changes are documented in the OpenAPI specification.
- [ ] Knowledge base is updated if processes or standards changed.

## Architecture & Security
- [ ] An ADR is created if a significant architectural decision was made.
- [ ] Security review passed (inputs validated, RLS policies updated if needed).
- [ ] Zero-trust principles are maintained.

## Review & Merge
- [ ] PR is approved by at least one other engineer.
- [ ] PR title and description clearly explain the *why* and *what* of the change.
