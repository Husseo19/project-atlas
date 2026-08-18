# Domain Model

This document outlines the core entities of the Project Atlas domain.

## Entities & Properties

- **Certification**
  - `id`: UUID
  - `name`: String
  - `provider`: String (e.g., "Microsoft")
  - `version`: String
  - `examCode`: String (e.g., "AZ-900")
  - `objectives`: List[StudyObjective]

- **StudyObjective**
  - `id`: UUID
  - `certificationId`: UUID
  - `code`: String
  - `description`: String
  - `weight`: Float (percentage of the exam)

- **Question**
  - `id`: UUID
  - `content`: String (Markdown)
  - `type`: Enum (MultipleChoice, MultipleResponse)
  - `options`: List[Option]
  - `correctAnswer`: List[String]
  - `explanation`: String (Markdown)
  - `difficulty`: Integer (1-5)
  - `tags`: List[String]

- **QuestionPool**
  - `id`: UUID
  - `certificationId`: UUID
  - `questions`: List[Question]
  - `version`: String

- **ExamBlueprint**
  - `id`: UUID
  - `certificationId`: UUID
  - `totalQuestions`: Integer
  - `passingScore`: Integer
  - `timeLimit`: Integer (minutes)
  - `distribution`: Map[ObjectiveId, Percentage]

- **ExamSession**
  - `id`: UUID
  - `userId`: UUID
  - `blueprintId`: UUID
  - `questions`: List[QuestionId]
  - `answers`: Map[QuestionId, Answer]
  - `startTime`: DateTime
  - `endTime`: DateTime (optional)
  - `score`: Float (optional)
  - `passed`: Boolean (optional)

- **TrainingSession**
  - `id`: UUID
  - `userId`: UUID
  - `objectiveId`: UUID (optional)
  - `mode`: Enum (Adaptive, Sequential)
  - `questions`: List[QuestionId]
  - `answers`: Map[QuestionId, Answer]
  - `startTime`: DateTime

- **MasteryProfile**
  - `id`: UUID
  - `userId`: UUID
  - `certificationId`: UUID
  - `objectiveMastery`: Map[ObjectiveId, Float]
  - `overallMastery`: Float
  - `readinessScore`: Float

- **LearningRecommendation**
  - `id`: UUID
  - `userId`: UUID
  - `recommendedObjectives`: List[ObjectiveId]
  - `reason`: String

- **UserProgress**
  - `id`: UUID
  - `userId`: UUID
  - `certificationId`: UUID
  - `sessionsCompleted`: Integer
  - `averageScore`: Float
  - `streak`: Integer
