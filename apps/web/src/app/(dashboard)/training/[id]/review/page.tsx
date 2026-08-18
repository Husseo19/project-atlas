export const dynamic = 'force-dynamic'

import { getSessionReviewData } from '../../../../actions'
import ReviewClient from './ReviewClient'
import Link from 'next/link'
import styles from './page.module.css'

export default async function TrainingReviewPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams: { session_id?: string, filter?: string }
}) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>No Session ID Provided</h2>
          <p>Please launch review from your training session summary.</p>
          <Link href="/dashboard" className={styles.backBtn} style={{ marginTop: '1rem', display: 'inline-block' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  try {
    const reviewData = await getSessionReviewData(sessionId)

    return (
      <ReviewClient
        certificationId={params.id}
        sessionId={sessionId}
        initialFilter={(searchParams.filter as 'all' | 'incorrect' | 'correct') || 'incorrect'}
        reviewData={reviewData}
      />
    )
  } catch (error: any) {
    console.error("Failed to load review data:", error)
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>Unable to Load Review</h2>
          <p>{error.message || 'The requested training session could not be found.'}</p>
          <Link href="/dashboard" className={styles.backBtn} style={{ marginTop: '1rem', display: 'inline-block' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }
}
