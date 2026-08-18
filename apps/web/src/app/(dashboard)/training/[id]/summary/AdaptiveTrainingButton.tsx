'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function AdaptiveTrainingButton({ sessionId, certificationId }: { sessionId: string, certificationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStart = () => {
    setLoading(true)
    router.push(`/training/${certificationId}?adaptive_from=${sessionId}`)
  }

  return (
    <button 
      className={styles.btnPrimary} 
      onClick={handleStart}
      disabled={loading}
    >
      {loading ? 'Generating Adaptive Session...' : 'Start Targeted Review ✨'}
    </button>
  )
}
