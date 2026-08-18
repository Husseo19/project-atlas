'use client'

import { useState, useEffect } from 'react'
import { toggleDarkMode } from '../../app/actions/theme'
import styles from './DarkModeToggle.module.css'
import { useRouter } from 'next/navigation'

export default function DarkModeToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setEnabled(initialEnabled)
    document.documentElement.setAttribute('data-theme', initialEnabled ? 'dark' : 'light')
  }, [initialEnabled])

  const handleToggle = async () => {
    setLoading(true)
    const newState = !enabled
    setEnabled(newState)
    
    // Optimistic UI update for immediate effect
    if (newState) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
    
    try {
      await toggleDarkMode(newState)
      router.refresh()
    } catch (e) {
      console.error(e)
      setEnabled(!newState) // revert on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.toggleContainer}>
      <label className={styles.switch}>
        <input 
          type="checkbox" 
          checked={enabled} 
          onChange={handleToggle}
          disabled={loading}
        />
        <span className={`${styles.slider} ${styles.round}`}></span>
      </label>
      <span className={styles.label}>
        {enabled ? 'Take me to the light side' : 'Take me to the dark side'}
      </span>
    </div>
  )
}
