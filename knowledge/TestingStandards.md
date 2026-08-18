# Testing Standards

## Test Pyramid
- **Unit Tests**: 70% of the suite. Fast, isolated tests focusing on domain logic.
- **Integration Tests**: 20% of the suite. Testing database access, API endpoints, and external services.
- **E2E Tests**: 10% of the suite. Critical user journeys (e.g., taking an exam).

## Specific Requirements
- **Learning Engine**: MUST have 100% test coverage. Scoring algorithms must be mathematically proven and deterministic.
- **Domain Logic**: Must be thoroughly unit tested without mocking (pure functions).
- **API Layer**: Test endpoints using test clients (e.g., `TestClient` in FastAPI).

## Naming Conventions
- File: `test_[module_name].py` or `[ComponentName].test.tsx`
- Function: `test_[function_name]_[scenario]_[expected_result]` (e.g., `test_calculate_score_all_correct_returns_100`)

## Coverage Thresholds
- Global minimum: 80% coverage.
- Domain & Learning Engine: 100% coverage.
- Branches must not lower the overall coverage percentage.

## CI/CD integration
- All tests must pass before a PR can be merged.
- E2E tests run on staging deployments.

## Test Data
- Use factories (e.g., `factory_boy`) for generating test data.
- Never use production data for testing.
