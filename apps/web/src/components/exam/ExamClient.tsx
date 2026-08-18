'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../../app/(dashboard)/exam/[id]/page.module.css'
import QuestionDisplay, { Question } from './QuestionDisplay'
import { submitExamSession } from '../../app/actions'

interface ExamClientProps {
  certificationCode: string
  sessionId: string
  questions: Question[]
}

export default function ExamClient({ certificationCode, sessionId, questions }: ExamClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120 * 60)

  const answersRef = useRef(answers)
  answersRef.current = answers

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isSubmitting) {
        setIsSubmitting(true)
        submitExamSession(sessionId, answersRef.current)
          .then(() => router.push(`/exam/${certificationCode}/summary?session_id=${sessionId}`))
          .catch(err => {
            console.error("Error submitting exam:", err)
            setIsSubmitting(false)
          })
      }
      return
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, isSubmitting, sessionId, certificationCode, router])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (questions.length === 0) {
    return <div className={styles.error}>No questions available for this exam.</div>
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentQuestion.id] || []

  const handleOptionSelect = (optionId: string | string[]) => {
    setAnswers(prev => {
      const current = prev[currentQuestion.id] || []
      
      if (Array.isArray(optionId)) {
         return { ...prev, [currentQuestion.id]: optionId }
      }
      
      if (currentQuestion.type === 'MultipleChoice') {
        return { ...prev, [currentQuestion.id]: [optionId] }
      } else {
        // Toggle for multiple response
        if (current.includes(optionId)) {
          return { ...prev, [currentQuestion.id]: current.filter(id => id !== optionId) }
        } else {
          return { ...prev, [currentQuestion.id]: [...current, optionId] }
        }
      }
    })
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsSubmitting(true)
      try {
        await submitExamSession(sessionId, answers)
        router.push(`/exam/${certificationCode}/summary?session_id=${sessionId}`)
      } catch (err) {
        console.error("Error submitting exam:", err)
        setIsSubmitting(false)
      }
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.examInfo}>
          <h1>Exam Session: {certificationCode}</h1>
          <div className={styles.timer}>Time Remaining: {formatTime(timeLeft)}</div>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
        <div className={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.questionSection}>
          <div className={styles.questionHeader}>
            <h2>Question {currentIndex + 1}</h2>
            <button 
              className={`${styles.flagBtn} ${flagged[currentQuestion.id] ? styles.flagged : ''}`}
              onClick={() => setFlagged(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
            >
              {flagged[currentQuestion.id] ? '⚑ Flagged for Review' : '⚐ Review Later'}
            </button>
          </div>
          <QuestionDisplay 
            question={currentQuestion}
            selectedOptions={currentAnswer}
            onOptionSelect={handleOptionSelect}
          />
        </div>
        
        <aside className={styles.navPanel}>
          <h3>Question Navigation</h3>
          <div className={styles.navGrid}>
            {questions.map((q, idx) => (
              <button
                key={q.id}
                className={`${styles.navGridItem} ${
                  currentIndex === idx ? styles.navGridItemCurrent : ''
                } ${answers[q.id]?.length ? styles.navGridItemAnswered : ''} ${
                  flagged[q.id] ? styles.navGridItemFlagged : ''
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>
      </main>

      <footer className={styles.footer}>
        <button 
          className={styles.btnSecondary}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        
        <button 
          className={styles.btnPrimary}
          onClick={handleNext}
          disabled={currentAnswer.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : (currentIndex === questions.length - 1 ? 'Submit Exam' : 'Next Question')}
        </button>
      </footer>
    </div>
  )
}
