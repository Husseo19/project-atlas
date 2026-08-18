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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        background: loading ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : undefined
      }}
    >
      {loading ? (
        <>
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>✨</span>
          <span>AI Tutor is Synthesizing Questions...</span>
        </>
      ) : (
        'Start Targeted Review ✨'
      )}
    </button>
  )
}
