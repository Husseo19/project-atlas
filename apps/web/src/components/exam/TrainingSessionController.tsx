'use client'

import { useState } from 'react'
import TrainingSetup from './TrainingSetup'
import TrainingClient from './TrainingClient'

interface Props {
  certification: {
    id: string
    name: string
    exam_code: string
    provider: string
  }
  objectives: Array<{
    id: string
    code: string
    description: string
    question_count: number
  }>
  unassignedQuestionCount: number
  totalQuestions: number
  source: string
  initialSessionData?: {
    sessionId: string
    questions: any[]
  }
}

export default function TrainingSessionController({
  certification,
  objectives,
  unassignedQuestionCount,
  totalQuestions,
  source,
  initialSessionData
}: Props) {
  const [sessionData, setSessionData] = useState<{
    sessionId: string
    questions: any[]
  } | null>(initialSessionData || null)

  if (sessionData && sessionData.questions && sessionData.questions.length > 0) {
    return (
      <TrainingClient
        certificationCode={certification.exam_code}
        initialQuestions={sessionData.questions}
        sessionId={sessionData.sessionId}
      />
    )
  }

  return (
    <TrainingSetup
      certification={certification}
      objectives={objectives}
      unassignedQuestionCount={unassignedQuestionCount}
      totalQuestions={totalQuestions}
      source={source}
      onStartSession={(data) => setSessionData(data)}
    />
  )
}
