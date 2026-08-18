export const dynamic = 'force-dynamic'

import { getCertificationTrainingMeta, startAdaptiveTrainingSession } from '../../../actions'
import TrainingSessionController from '../../../../components/exam/TrainingSessionController'
import styles from './page.module.css'

export default async function TrainingSessionPage({ 
  params,
  searchParams
}: { 
  params: { id: string },
  searchParams: { adaptive_from?: string }
}) {
  try {
    const meta = await getCertificationTrainingMeta(params.id)
    
    let initialSessionData;
    if (searchParams.adaptive_from) {
      initialSessionData = await startAdaptiveTrainingSession(searchParams.adaptive_from)
    }

    return (
      <TrainingSessionController 
        certification={meta.certification}
        objectives={meta.objectives}
        unassignedQuestionCount={meta.unassignedQuestionCount}
        totalQuestions={meta.totalQuestions}
        source={meta.source}
        initialSessionData={initialSessionData}
      />
    )
  } catch (error: any) {
    console.error("Failed to load training session:", error)
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Failed to load training session: {error.message}
        </div>
      </div>
    )
  }
}
