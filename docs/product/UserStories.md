# User Stories (Initial MVP)

## Epic: User Onboarding & Auth
- **US-001**: As an Exam Candidate, I want to sign up using my email or GitHub account, so I can save my progress.
  - *AC*: Supabase Auth integration; User profile created in DB.
- **US-002**: As an Exam Candidate, I want to select a certification to study for, so my dashboard configures itself to that exam.
  - *AC*: Certification selection screen; Updates UserProgress record.

## Epic: Exam Simulation
- **US-003**: As an Enterprise Learner, I want to take a timed practice exam that matches the real exam blueprint, so I can simulate test conditions.
  - *AC*: Generates ExamSession; Enforces time limit; Distribution matches ExamBlueprint.
- **US-004**: As an Exam Candidate, I want to review my exam results immediately, so I can see which questions I got wrong.
  - *AC*: Score calculation; detailed review screen with correct answers shown.

## Epic: Training Mode & Adaptive Learning
- **US-005**: As a Career Switcher, I want to practice specific objectives (e.g., "Describe cloud concepts") in an untimed mode, so I can learn without pressure.
  - *AC*: TrainingSession creation; immediate feedback after each question.
- **US-006**: As an Enterprise Learner, I want the system to give me harder questions on topics I know well and easier questions on topics I struggle with, so my study time is optimized.
  - *AC*: Adaptive algorithm selects questions based on MasteryProfile.
- **US-007**: As a Career Switcher, I want detailed AI-generated explanations for why an answer is wrong, so I can understand the underlying concept.
  - *AC*: Explanation shown in Training Mode; linked to specific distractor.

## Epic: Dashboard & Analytics
- **US-008**: As an Exam Candidate, I want to see a Readiness Score, so I know when I am prepared to book the real exam.
  - *AC*: Dashboard widget showing 0-100% readiness based on MasteryProfile.
- **US-009**: As an Enterprise Learner, I want to see a breakdown of my mastery by exam objective, so I know what to study next.
  - *AC*: Radar chart or progress bars for each StudyObjective.
