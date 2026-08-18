import { startExamSession } from '../../../actions'
import ExamClient from '../../../../components/exam/ExamClient'
import styles from './page.module.css'

export default async function ExamSessionPage({ params }: { params: { id: string } }) {
  try {
    const { sessionId, questions } = await startExamSession(params.id)
    
    return (
      <ExamClient 
        certificationCode={params.id} 
        sessionId={sessionId} 
        questions={questions} 
      />
    )
  } catch (error: any) {
    console.error("Failed to start exam session:", error)
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Failed to load exam session: {error.message}
        </div>
      </div>
    )
  }
}
