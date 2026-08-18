'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import QuestionScorer from '../../../../../components/community/QuestionScorer'
import DiscussionPanel from '../../../../../components/community/DiscussionPanel'

interface ReviewItem {
  index: number
  question: any
  userAnswer: string[]
  correctAnswers: string[]
  isCorrect: boolean
  objective?: {
    id: string
    code: string
    description: string
  }
}

interface Props {
  certificationId: string
  sessionId: string
  initialFilter: 'all' | 'incorrect' | 'correct'
  reviewData: {
    session: any
    certification: any
    items: ReviewItem[]
  }
}

export default function ReviewClient({
  certificationId,
  sessionId,
  initialFilter,
  reviewData
}: Props) {
  const { session, certification, items } = reviewData
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>(() => {
    if (initialFilter === 'incorrect' && session.incorrectCount === 0) {
      return 'all'
    }
    return initialFilter
  })

  const filteredItems = useMemo(() => {
    if (filter === 'incorrect') {
      return items.filter(i => !i.isCorrect)
    }
    if (filter === 'correct') {
      return items.filter(i => i.isCorrect)
    }
    return items
  }, [items, filter])

  const formatExplanation = (text?: string) => {
    if (!text) return "No explanation provided for this question."
    return text.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
      <p key={idx} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
        {paragraph}
      </p>
    ))
  }

  const renderContentWithImages = (content: string) => {
    const parts = content.split(/(\[IMAGE:\s*https?:\/\/[^\]\s]+\])/g)
    return parts.map((part, index) => {
      const match = part.match(/\[IMAGE:\s*(https?:\/\/[^\]\s]+)\]/)
      if (match) {
        return (
          <div key={index} style={{ margin: '1rem 0', maxWidth: '100%', overflow: 'hidden' }}>
            <img 
              src={match[1]} 
              alt="Question Exhibit" 
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
            />
          </div>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const scrollToQuestion = (index: number) => {
    const el = document.getElementById(`question-card-${index}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={`/training/${certificationId}/summary?session_id=${sessionId}`} className={styles.backBtn}>
          ← Back to Session Summary
        </Link>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Training Question Review</h1>
            <p className={styles.subtitle}>
              {certification?.name || 'Certification'} ({certification?.exam_code || ''}) • Score: {session.score}%
            </p>
          </div>
        </div>
      </header>

      {/* MEASUREUP CONTROL PANEL & NAVIGATOR */}
      <section className={styles.controlPanel}>
        <div className={styles.filterRow}>
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.filterTab} ${filter === 'incorrect' ? styles.active : ''}`}
              onClick={() => setFilter('incorrect')}
            >
              Missed Questions ({session.incorrectCount})
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All Questions ({session.totalQuestions})
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${filter === 'correct' ? styles.active : ''}`}
              onClick={() => setFilter('correct')}
            >
              Correct ({session.correctCount})
            </button>
          </div>

          <div className={styles.statSummary}>
            <span className={styles.statCorrect}>
              ✓ {session.correctCount} Correct
            </span>
            <span className={styles.statIncorrect}>
              ✗ {session.incorrectCount} Missed
            </span>
          </div>
        </div>

        {/* Quick Jump Navigator Pills */}
        <div className={styles.navGrid}>
          {items.map((item) => (
            <button
              key={item.index}
              type="button"
              onClick={() => scrollToQuestion(item.index)}
              className={`${styles.navPill} ${item.isCorrect ? styles.correct : styles.incorrect}`}
              title={`Question ${item.index}: ${item.isCorrect ? 'Correct' : 'Missed'}`}
            >
              {item.index}
            </button>
          ))}
        </div>
      </section>

      {/* QUESTIONS LIST */}
      <main>
        {filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No Questions Matching Filter</h2>
            <p>
              {filter === 'incorrect' 
                ? "Congratulations! You got all questions correct in this session."
                : "No questions to display."}
            </p>
            <button 
              type="button" 
              className={styles.filterTab} 
              style={{ marginTop: '1rem', background: 'var(--color-primary)', color: 'white' }}
              onClick={() => setFilter('all')}
            >
              View All Questions
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const { question, userAnswer, correctAnswers, isCorrect, objective } = item

            return (
              <div 
                key={question.id} 
                id={`question-card-${item.index}`}
                className={styles.reviewCard}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.questionMeta}>
                    <span className={styles.questionNumber}>Question {item.index}</span>
                    <span className={`${styles.statusBadge} ${isCorrect ? styles.statusCorrect : styles.statusIncorrect}`}>
                      {isCorrect ? '✓ Correct' : '✗ Missed'}
                    </span>
                    {objective && (
                      <span className={styles.objectiveBadge}>
                        {objective.code}: {objective.description}
                      </span>
                    )}
                  </div>
                  {question.is_verified && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      🛡️ Verified Ground-Truth
                    </span>
                  )}
                </div>

                {/* Question Prompt */}
                <div className={styles.questionContent}>
                  {renderContentWithImages(question.content)}
                </div>

                {/* Choices Comparison */}
                <div className={styles.optionsComparison}>
                  {Array.isArray(question.options) && question.options.map((opt: any, optIdx: number) => {
                    const optId = opt.id || `opt_${optIdx}`
                    const isUserChoice = userAnswer.includes(optId)
                    const isCorrectChoice = correctAnswers.includes(optId)
                    const isBoth = isUserChoice && isCorrectChoice

                    let rowClass = ''
                    if (isBoth) {
                      rowClass = styles.isBoth
                    } else if (isUserChoice) {
                      rowClass = styles.isUserChoice
                    } else if (isCorrectChoice) {
                      rowClass = styles.isCorrectChoice
                    }

                    const letter = opt.id?.replace(/^opt_/i, '') || String.fromCharCode(65 + optIdx)

                    return (
                      <div 
                        key={optId} 
                        className={`${styles.optionRow} ${rowClass}`}
                      >
                        <div className={styles.optionMarker}>
                          <span className={styles.choiceLetter}>{letter}.</span>
                        </div>
                        <div className={styles.optionText}>
                          {opt.text || opt}
                        </div>
                        <div className={styles.optionTags}>
                          {isBoth && (
                            <span className={styles.tagCorrect}>
                              ✓ Your Correct Choice
                            </span>
                          )}
                          {isUserChoice && !isCorrectChoice && (
                            <span className={styles.tagUser}>
                              ✗ Your Choice
                            </span>
                          )}
                          {isCorrectChoice && !isUserChoice && (
                            <span className={styles.tagCorrect}>
                              ✓ Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Explanation & Rationale */}
                <div className={styles.explanationBox}>
                  <div className={styles.explanationTitle}>
                    <span>💡</span> Comprehensive Explanation & Distractor Proof
                  </div>
                  <div className={styles.explanationText}>
                    {formatExplanation(question.explanation)}
                  </div>
                </div>

                {/* Official Microsoft Learn References */}
                {question?.verification_metadata?.official_citations && question.verification_metadata.official_citations.length > 0 && (
                  <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(0, 120, 212, 0.04)', border: '1px solid rgba(0, 120, 212, 0.15)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>📚</span> Official Microsoft Learn References:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                      {question.verification_metadata.official_citations.map((cite: any, cIdx: number) => {
                        if (typeof cite === 'object' && cite.url) {
                          return (
                            <li key={cIdx} style={{ marginBottom: '0.4rem', lineHeight: '1.4' }}>
                              <a 
                                href={cite.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                                onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                              >
                                {cite.title || 'Microsoft Learn Article'} ↗
                              </a>
                              {cite.description && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                                  {cite.description.slice(0, 150)}...
                                </div>
                              )}
                            </li>
                          )
                        }
                        return (
                          <li key={cIdx} style={{ marginBottom: '0.2rem' }}>{cite}</li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {/* Community & Quality Controls */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <QuestionScorer questionId={question.id} />
                  <DiscussionPanel questionId={question.id} />
                </div>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
