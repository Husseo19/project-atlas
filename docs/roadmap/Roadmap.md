# Project Atlas: 90-Day Roadmap

## Phase 1: Foundation (Weeks 1-2)
**Goal**: Establish the engineering baseline and knowledge base.
- Initialize Git repository and package-based monorepo structure.
- Generate and refine all Engineering Knowledge Base documents (Constitution, PRD, Architecture).
- Set up CI/CD pipelines (linting, testing).
- Configure Supabase projects (Dev/Staging/Prod).
- Establish Antigravity IDE configuration and skills.

## Phase 2: Core Domain (Weeks 3-4)
**Goal**: Implement the pure business logic.
- Implement the Domain Model (Entities, Value Objects) in Python.
- Build the Learning Engine (scoring, mastery calculation algorithms).
- Build the Question Factory core interfaces.
- Write 100% unit test coverage for the Domain and Learning Engine.

## Phase 3: Backend Skeleton (Weeks 5-6)
**Goal**: Stand up the API and database.
- Initialize FastAPI application.
- Implement Supabase Auth integration and RLS policies.
- Build the LLM Provider Abstraction Layer (OpenAI/Anthropic clients).
- Define OpenAPI contracts for frontend consumption.
- Implement database repositories.

## Phase 4: Frontend Skeleton (Weeks 7-8)
**Goal**: Stand up the user interface.
- Initialize Next.js App Router project.
- Implement authentication flows (Login/Signup).
- Build the main Dashboard layout and navigation.
- Implement UI components (Buttons, Cards, Progress Bars).

## Phase 5: First Vertical Slice (Weeks 9-10)
**Goal**: End-to-end functionality for the Question flow.
- Admin flow: Generate a question via AI -> Validate -> Store in DB.
- User flow: Fetch question -> Display in Training Mode -> Submit Answer -> Get Explanation.
- Update Analytics Engine and display on Dashboard.

## Phase 6: Hardening & Polish (Weeks 11-12)
**Goal**: Ready for MVP launch.
- End-to-end testing of critical user journeys.
- Prompt refinement and cost/performance optimization.
- UX polish (animations, loading states, error handling).
- Security audit and penetration testing simulation.
- Beta launch to a small group of friendly users.
