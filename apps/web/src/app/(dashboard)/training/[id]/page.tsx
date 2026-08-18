import { startTrainingSession, startAdaptiveTrainingSession } from '../../../actions'
import TrainingClient from '../../../../components/exam/TrainingClient'
import styles from './page.module.css'

export default async function TrainingSessionPage({ 
  params,
  searchParams
}: { 
  params: { id: string },
  searchParams: { adaptive_from?: string }
}) {
  try {
    let sessionData;
    if (searchParams.adaptive_from) {
      sessionData = await startAdaptiveTrainingSession(searchParams.adaptive_from)
    } else {
      sessionData = await startTrainingSession(params.id)
    }
    
    const { sessionId, questions } = sessionData
    
    return (
      <TrainingClient 
        certificationCode={params.id} 
        initialQuestions={questions}
        sessionId={sessionId}
      />
    )
  } catch (error: any) {
    console.error("Failed to start training session:", error)
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Failed to load training session: {error.message}
        </div>
      </div>
    )
  }
}
