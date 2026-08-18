import { getSessionResult } from '../../../../actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

export default async function ExamSummaryPage({ params, searchParams }: { params: { id: string }, searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect(`/exam/${params.id}`)
  }

  const result = await getSessionResult(sessionId)

  if (!result) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h2>Result Not Found</h2>
          <p>We couldn't find the results for this session.</p>
          <Link href="/dashboard" className={styles.btnPrimary}>Return to Dashboard</Link>
        </div>
      </div>
    )
  }

  const isPassing = result.passed

  return (
    <div className={styles.container}>
      <div className={`${styles.resultCard} ${isPassing ? styles.pass : styles.fail}`}>
        <div className={styles.badge}>
          {isPassing ? '🎉 PASSED' : '❌ FAILED'}
        </div>
        
        <h1 className={styles.title}>Exam Results</h1>
        <p className={styles.subtitle}>Certification: {params.id}</p>

        <div className={styles.scoreCircle}>
          <svg viewBox="0 0 36 36" className={styles.circularChart}>
            <path className={styles.circleBg}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path className={`${styles.circle} ${isPassing ? styles.circlePass : styles.circleFail}`}
              strokeDasharray={`${result.score / 10}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className={styles.scoreText}>
            <span className={styles.scoreValue}>{result.score}</span>
            <span className={styles.scoreTotal}>/ 1000</span>
          </div>
        </div>

        <div className={styles.message}>
          {isPassing 
            ? "Congratulations! You have successfully passed the exam. Your hard work has paid off."
            : "Keep practicing! You didn't meet the passing score of 700 this time, but you can try again."}
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.btnSecondary}>Back to Dashboard</Link>
          <Link href={`/exam/${params.id}`} className={styles.btnPrimary}>
            {isPassing ? 'Take Another Exam' : 'Retry Exam'}
          </Link>
        </div>
      </div>
    </div>
  )
}
