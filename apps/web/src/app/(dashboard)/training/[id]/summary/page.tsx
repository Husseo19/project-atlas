import { getSessionResult } from '../../../../actions'
import styles from './page.module.css'
import Link from 'next/link'
import AdaptiveTrainingButton from './AdaptiveTrainingButton'

export default async function TrainingSummaryPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string },
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id
  
  if (!sessionId) {
    return <div className={styles.container}>No session ID provided.</div>
  }

  const session = await getSessionResult(sessionId)

  if (!session) {
    return <div className={styles.container}>Session not found.</div>
  }

  const result = {
    score: session.score,
    totalQuestions: session.questions.length,
    correctAnswers: Math.round((session.score / 100) * session.questions.length),
    sessionId: session.id,
    metadata: (session as any).metadata // Access the JSONB metadata
  }

  const insights = result.metadata?.insights
  const hasInsights = insights && !insights.includes("Please add your OpenAI API Key")

  const incorrectAnswers = result.totalQuestions - result.correctAnswers

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Training Session Analysis</h1>
        <p className={styles.subtitle}>Review your performance and personalized feedback.</p>
      </header>

      <div className={styles.contentGrid}>
        <section className={styles.scoreSection}>
          <div className={styles.scoreCard}>
            <div className={styles.scoreCircle}>
              <svg viewBox="0 0 36 36" className={styles.circularChart}>
                <path
                  className={styles.circleBg}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={styles.circle}
                  strokeDasharray={`${result.score}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className={styles.percentage}>{Math.round(result.score)}%</text>
              </svg>
            </div>
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Total Questions</span>
                <span className={styles.statValue}>{result.totalQuestions}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Correct</span>
                <span className={styles.statValue} style={{ color: '#10b981' }}>{result.correctAnswers}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Missed</span>
                <span className={styles.statValue} style={{ color: '#ef4444' }}>{incorrectAnswers}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>Next Steps</h3>
            <p className={styles.actionDesc}>Review your answers or launch an AI-targeted adaptive session.</p>
            
            {incorrectAnswers > 0 ? (
              <Link 
                href={`/training/${params.id}/review?session_id=${result.sessionId}&filter=incorrect`}
                className={styles.btnPrimary}
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
              >
                🔍 Review Missed Questions ({incorrectAnswers})
              </Link>
            ) : (
              <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>
                🎉 Perfect Score! No missed questions.
              </div>
            )}

            <Link 
              href={`/training/${params.id}/review?session_id=${result.sessionId}&filter=all`}
              className={styles.btnSecondary}
              style={{ marginBottom: '1rem', display: 'block' }}
            >
              📖 Review All Questions ({result.totalQuestions})
            </Link>

            <AdaptiveTrainingButton sessionId={result.sessionId} certificationId={params.id} />

            <Link href="/dashboard" className={styles.btnSecondary} style={{ marginTop: '0.5rem', display: 'block' }}>
              Back to Dashboard
            </Link>
          </div>
        </section>

        <section className={styles.insightsSection}>
          <div className={styles.insightsCard}>
            <div className={styles.insightsHeader}>
              <div className={styles.aiIcon}>✨</div>
              <h2>AI Tutor Insights</h2>
            </div>
            
            <div className={styles.insightsBody}>
              {insights ? (
                <div className={styles.markdownWrapper}>
                  {insights.split('\n').filter((p: string) => p.trim() !== '').map((paragraph: string, idx: number) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p>Generating your performance insights...</p>
              )}
            </div>
            
            {!hasInsights && (
              <div className={styles.apiKeyPrompt}>
                <p>💡 Want deep learning insights? Make sure you've added your OpenAI API key in the Dashboard.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
