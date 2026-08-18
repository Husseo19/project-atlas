'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import styles from './TrainingSetup.module.css'
import { startCustomTrainingSession } from '../../app/actions'

interface Objective {
  id: string
  code: string
  description: string
  question_count: number
}

interface Certification {
  id: string
  name: string
  exam_code: string
  provider: string
}

interface Props {
  certification: Certification
  objectives: Objective[]
  unassignedQuestionCount: number
  totalQuestions: number
  source: string
  onStartSession: (sessionData: { sessionId: string, questions: any[] }) => void
}

export default function TrainingSetup({
  certification,
  objectives,
  unassignedQuestionCount,
  totalQuestions,
  source,
  onStartSession
}: Props) {
  // 1. Objectives Selection: default to all selected
  const allObjectiveIds = useMemo(() => objectives.map(o => o.id), [objectives])
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState<string[]>(allObjectiveIds)
  const [includeUnassigned, setIncludeUnassigned] = useState(true)

  // 2. Question Count: default 25 or max available
  const availableQuestionsCount = useMemo(() => {
    let count = 0
    objectives.forEach(obj => {
      if (selectedObjectiveIds.includes(obj.id)) {
        count += obj.question_count
      }
    })
    if (includeUnassigned) {
      count += unassignedQuestionCount
    }
    return count > 0 ? count : totalQuestions
  }, [objectives, selectedObjectiveIds, includeUnassigned, unassignedQuestionCount, totalQuestions])

  const defaultCount = Math.min(25, availableQuestionsCount || 25)
  const [questionCount, setQuestionCount] = useState<number>(defaultCount)
  const [isRandomized, setIsRandomized] = useState<boolean>(true)
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered'>('all')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Handlers for objective selection
  const handleToggleObjective = (id: string) => {
    if (selectedObjectiveIds.includes(id)) {
      setSelectedObjectiveIds(selectedObjectiveIds.filter(item => item !== id))
    } else {
      setSelectedObjectiveIds([...selectedObjectiveIds, id])
    }
  }

  const handleSelectAll = () => {
    setSelectedObjectiveIds(allObjectiveIds)
    setIncludeUnassigned(true)
  }

  const handleDeselectAll = () => {
    setSelectedObjectiveIds([])
    setIncludeUnassigned(false)
  }

  // Handle Preset Click
  const handlePreset = (preset: number | 'all') => {
    if (preset === 'all') {
      setQuestionCount(availableQuestionsCount)
    } else {
      setQuestionCount(Math.min(preset, availableQuestionsCount))
    }
  }

  // Handle Launch Session
  const handleLaunch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const sessionData = await startCustomTrainingSession({
        certificationId: certification.id,
        selectedObjectiveIds: selectedObjectiveIds.length > 0 ? selectedObjectiveIds : undefined,
        includeUnassigned,
        questionCount: Math.min(questionCount, availableQuestionsCount || questionCount),
        isRandomized,
        filterMode
      })

      onStartSession(sessionData)
    } catch (err: any) {
      console.error("Failed to launch custom training session:", err)
      setError(err.message || 'Failed to start customized training session.')
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backBtn}>
          ← Back to Dashboard
        </Link>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>{certification.name}</h1>
            <p className={styles.subtitle}>
              Configure your practice test parameters (MeasureUp Practice Engine)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={styles.badge}>
              {certification.exam_code}
            </span>
            {source === 'dump' && (
              <span className={styles.badge} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                ⚡ Dark Side Pool Active
              </span>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* SECTION 1: OBJECTIVES SELECTION */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span>🎯</span> 1. Select Study Objectives (Domains)
          </h2>
          <div className={styles.quickActions}>
            <button type="button" onClick={handleSelectAll} className={styles.quickBtn}>
              Select All
            </button>
            <button type="button" onClick={handleDeselectAll} className={styles.quickBtn}>
              Deselect All
            </button>
          </div>
        </div>

        <div className={styles.objectivesList}>
          {objectives.map((obj) => {
            const isSelected = selectedObjectiveIds.includes(obj.id)
            return (
              <div
                key={obj.id}
                className={`${styles.objectiveItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleToggleObjective(obj.id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className={styles.checkbox}
                />
                <div className={styles.objectiveContent}>
                  <div className={styles.objectiveCode}>Objective {obj.code}</div>
                  <div className={styles.objectiveDesc}>{obj.description}</div>
                </div>
                <div className={styles.countBadge}>
                  {obj.question_count} Qs
                </div>
              </div>
            )
          })}

          {unassignedQuestionCount > 0 && (
            <div
              className={`${styles.objectiveItem} ${includeUnassigned ? styles.selected : ''}`}
              onClick={() => setIncludeUnassigned(!includeUnassigned)}
            >
              <input
                type="checkbox"
                checked={includeUnassigned}
                onChange={() => {}}
                className={styles.checkbox}
              />
              <div className={styles.objectiveContent}>
                <div className={styles.objectiveCode}>General / Core Pool</div>
                <div className={styles.objectiveDesc}>Comprehensive certification questions & case studies</div>
              </div>
              <div className={styles.countBadge}>
                {unassignedQuestionCount} Qs
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: QUESTION POOL SIZE */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span>📊</span> 2. Number of Questions
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Available: <strong>{availableQuestionsCount}</strong> questions
          </span>
        </div>

        <div className={styles.presetsRow}>
          {[10, 25, 50, 100].map((count) => {
            const isAvailable = availableQuestionsCount >= count
            const isActive = questionCount === count
            return (
              <button
                key={count}
                type="button"
                className={`${styles.presetBtn} ${isActive ? styles.active : ''}`}
                disabled={!isAvailable}
                onClick={() => handlePreset(count)}
              >
                {count} Qs
              </button>
            )
          })}
          <button
            type="button"
            className={`${styles.presetBtn} ${questionCount === availableQuestionsCount ? styles.active : ''}`}
            onClick={() => handlePreset('all')}
          >
            All ({availableQuestionsCount})
          </button>
        </div>

        <div className={styles.sliderRow}>
          <input
            type="range"
            min="5"
            max={Math.max(5, availableQuestionsCount)}
            value={Math.min(questionCount, availableQuestionsCount)}
            onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
            className={styles.slider}
          />
          <input
            type="number"
            min="1"
            max={availableQuestionsCount}
            value={questionCount}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val)) {
                setQuestionCount(Math.max(1, Math.min(val, availableQuestionsCount)))
              }
            }}
            className={styles.numberInput}
          />
        </div>
      </section>

      {/* SECTION 3: SESSION OPTIONS */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>
          <span>⚙️</span> 3. Session Customization
        </h2>

        <div className={styles.optionsGrid}>
          <div className={styles.optionCard}>
            <div>
              <div className={styles.optionLabel}>Randomize Question Order</div>
              <div className={styles.optionHelp}>Shuffle questions (Fisher-Yates random)</div>
            </div>
            <input
              type="checkbox"
              checked={isRandomized}
              onChange={(e) => setIsRandomized(e.target.checked)}
              className={styles.checkbox}
            />
          </div>

          <div className={styles.optionCard}>
            <div>
              <div className={styles.optionLabel}>Unanswered Questions Only</div>
              <div className={styles.optionHelp}>Filter out questions you've already seen</div>
            </div>
            <input
              type="checkbox"
              checked={filterMode === 'unanswered'}
              onChange={(e) => setFilterMode(e.target.checked ? 'unanswered' : 'all')}
              className={styles.checkbox}
            />
          </div>
        </div>
      </section>

      {/* LAUNCH CTA */}
      <div className={styles.launchBox}>
        <div className={styles.summaryText}>
          <h3>Ready to Practice?</h3>
          <p>
            Configured <strong>{Math.min(questionCount, availableQuestionsCount)} questions</strong> across{' '}
            <strong>
              {selectedObjectiveIds.length + (includeUnassigned && unassignedQuestionCount > 0 ? 1 : 0)} domains
            </strong>{' '}
            • {isRandomized ? 'Randomized Order' : 'Sequential Order'}
          </p>
        </div>

        <button
          type="button"
          className={styles.launchBtn}
          onClick={handleLaunch}
          disabled={isLoading || availableQuestionsCount === 0}
        >
          {isLoading ? (
            'Preparing Session...'
          ) : (
            <>
              <span>🚀</span> Start Training Session
            </>
          )}
        </button>
      </div>
    </div>
  )
}
