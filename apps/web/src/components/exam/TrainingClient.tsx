'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../../app/(dashboard)/training/[id]/page.module.css'
import QuestionDisplay, { Question } from './QuestionDisplay'
import DiscussionPanel from '../community/DiscussionPanel'
import QuestionScorer from '../community/QuestionScorer'

import { submitTrainingSession } from '../../app/actions'

interface TrainingClientProps {
  certificationCode: string
  initialQuestions: Question[]
  sessionId: string
}

export default function TrainingClient({ certificationCode, initialQuestions, sessionId }: TrainingClientProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isGeneratingAdaptive, setIsGeneratingAdaptive] = useState(false)
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (questions.length === 0) return <div className={styles.error}>No questions available.</div>

  const currentQuestion = questions[currentIndex]
  const currentExplanation = currentQuestion?.explanation || "No explanation available."

  const handleOptionSelect = (optionId: string | string[]) => {
    if (isSubmitted) return

    if (Array.isArray(optionId)) {
      setCurrentAnswer(optionId)
      return
    }

    if (currentQuestion.type === 'MultipleChoice') {
      setCurrentAnswer([optionId])
    } else {
      setCurrentAnswer(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    }
  }

  const handleCheckAnswer = async () => {
    setIsSubmitted(true)
    
    // Support either correct_answers array or correctAnswer string/array
    const correctAnswers = (currentQuestion as any).correct_answers || (currentQuestion as any).correctAnswer || []
    
    const sortedUserAnswer = [...currentAnswer].sort()
    const sortedCorrectAnswer = Array.isArray(correctAnswers) ? [...correctAnswers].sort() : [correctAnswers]
    
    const correct = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer)
    setIsCorrect(correct)
    
    // Save to sessionAnswers
    setSessionAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: currentAnswer
    }))

    if (!correct) {
      // In a real app we'd generate adaptive questions, for now just show explanation
      // setIsGeneratingAdaptive(true)
    }
  }

  const formatExplanation = (text: string) => {
    if (!text) return "No explanation available."
    
    // Some questions have explanation text in a single line. 
    // We inject newlines before common option explanations to split them nicely.
    let formattedText = text
      .replace(/\.\s+(Option [A-Z])/gi, '.\n$1')
      .replace(/\.\s+([A-Z]\.)/g, '.\n$1')
      .replace(/\.\s+(The correct answer)/gi, '.\n$1')
      .replace(/\.\s+(Correct answer)/gi, '.\n$1')
      .replace(/\.\s+(Incorrect answer)/gi, '.\n$1')

    return formattedText.split('\n').filter(p => p.trim() !== '').map((paragraph, idx, arr) => (
      <div key={idx} style={{ 
        marginBottom: '1rem', 
        paddingBottom: idx !== arr.length - 1 ? '1rem' : 0, 
        borderBottom: idx !== arr.length - 1 ? '1px solid #eee' : 'none' 
      }}>
        {paragraph}
      </div>
    ))
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setCurrentAnswer([])
      setIsSubmitted(false)
      setIsCorrect(null)
    } else {
      setIsSubmitting(true)
      try {
        await submitTrainingSession(sessionId, sessionAnswers)
        router.push(`/training/${certificationCode}/summary?session_id=${sessionId}`)
      } catch (err) {
        console.error("Failed to submit training", err)
        alert('Failed to submit training data. Please try again.')
        setIsSubmitting(false)
      }
    }
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/dashboard" className={styles.backBtn}>← Exit Training</Link>
          <div className={styles.modeBadge}>Training Mode</div>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
        <div className={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </div>
      </header>

      <main className={styles.main}>
        <QuestionDisplay 
          question={currentQuestion}
          selectedOptions={currentAnswer}
          onOptionSelect={handleOptionSelect}
        />

        {isSubmitted && (
          <div className={`${styles.feedbackCard} ${isCorrect ? styles.correct : styles.incorrect}`}>
            <h3 className={styles.feedbackTitle} style={{ color: isCorrect ? '#0070f3' : '#e00' }}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </h3>
            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Explanation</h4>
            <div className={styles.explanation}>
              {formatExplanation(currentExplanation)}
            </div>
            {currentQuestion?.verification_metadata?.official_citations && currentQuestion.verification_metadata.official_citations.length > 0 && (
              <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>📚</span> Official Documentation References:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                  {currentQuestion.verification_metadata.official_citations.map((cite: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>{cite}</li>
                  ))}
                </ul>
              </div>
            )}
            {isGeneratingAdaptive && (
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                <span className={styles.pulse}>✨ Analyzing mistake and generating a targeted follow-up question...</span>
              </div>
            )}
            
            <QuestionScorer questionId={currentQuestion.id} />
            <DiscussionPanel questionId={currentQuestion.id} />
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        {!isSubmitted ? (
          <button 
            className={styles.btnPrimary}
            onClick={handleCheckAnswer}
            disabled={currentAnswer.length === 0}
          >
            Check Answer
          </button>
        ) : (
          <button 
            className={styles.btnNext}
            onClick={handleNext}
            disabled={isGeneratingAdaptive || isSubmitting}
          >
            {isSubmitting ? 'Analyzing Performance...' : (isGeneratingAdaptive ? 'Generating Next...' : (currentIndex === questions.length - 1 ? 'Finish Training' : 'Continue'))}
          </button>
        )}
      </footer>
    </div>
  )
}
