'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import QuestionDisplay, { Question } from '../../../../../components/exam/QuestionDisplay'
import DiscussionPanel from '../../../../../components/community/DiscussionPanel'

export default function ExamReviewPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [incorrectQuestions, setIncorrectQuestions] = useState<{ question: Question, userAnswer: string[] }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviewData() {
      if (!sessionId) {
        setLoading(false)
        return
      }
      
      try {
        const token = localStorage.getItem('atlas_token')
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
        
        // 1. Fetch Session
        const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/${sessionId}`, { headers })
        if (!sessionRes.ok) throw new Error('Failed to fetch session')
        const sessionData = await sessionRes.json()

        // 2. Fetch all questions for cert
        const qRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions?certification_id=${params.id}`, { headers })
        if (!qRes.ok) throw new Error('Failed to fetch questions')
        const allQuestions = await qRes.json()
        const questionMap = new Map(allQuestions.map((q: any) => [q.id, q]))
        
        // 3. Filter for incorrect questions
        const incorrect: { question: Question, userAnswer: string[] }[] = []
        
        for (const qId of sessionData.questions) {
          const userAns = sessionData.answers[qId] || []
          const q = questionMap.get(qId) as Question
          if (q) {
            const correctAns = (q as any).correct_answers || (q as any).correctAnswer || []
            const sortedUser = [...userAns].sort()
            const sortedCorrect = [...correctAns].sort()
            
            if (JSON.stringify(sortedUser) !== JSON.stringify(sortedCorrect)) {
              incorrect.push({ question: q, userAnswer: userAns })
            }
          }
        }
        
        setIncorrectQuestions(incorrect)
      } catch (err) {
        console.error("Failed to load review data:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchReviewData()
  }, [sessionId, params.id])

  if (loading) return <div className={styles.container}>Loading review data...</div>
  if (!sessionId) return <div className={styles.container}>No session ID provided.</div>

  const formatExplanation = (text?: string) => {
    if (!text) return "No explanation available."
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href={`/exam/${params.id}/summary?session_id=${sessionId}`} className={styles.backBtn}>← Back to Summary</Link>
          <h1 className={styles.title}>Review Incorrect Answers</h1>
        </div>
        <p className={styles.subtitle}>You got {incorrectQuestions.length} questions wrong. Review the explanations below.</p>
      </header>

      <main className={styles.main}>
        {incorrectQuestions.length === 0 ? (
          <div className={styles.perfectScore}>
            <h2>Perfect Score!</h2>
            <p>You didn't get any questions wrong.</p>
          </div>
        ) : (
          incorrectQuestions.map((item, index) => (
            <div key={item.question.id} className={styles.reviewCard}>
              <div className={styles.questionNumber}>Question {index + 1}</div>
              <QuestionDisplay 
                question={item.question}
                selectedOptions={item.userAnswer}
                onOptionSelect={() => {}} // Disabled in review
              />
              
              <div className={styles.feedbackCard}>
                <h3 className={styles.feedbackTitle}>Explanation</h3>
                <div className={styles.explanation}>{formatExplanation(item.question.explanation)}</div>
                <div className={styles.correctAnswersList}>
                  <strong>Correct Answer(s): </strong>
                  {item.question.options
                    .filter(opt => (item.question.correct_answers || (item.question as any).correctAnswer || []).includes(opt.id))
                    .map(opt => `${opt.id}) ${opt.text}`)
                    .join(", ")}
                </div>
                
                <DiscussionPanel questionId={item.question.id} />
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
