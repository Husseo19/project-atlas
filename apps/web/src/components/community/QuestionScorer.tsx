'use client'

import { useState } from 'react'
import { scoreQuestion } from '../../app/actions'

interface Props {
  questionId: string;
}

export default function QuestionScorer({ questionId }: Props) {
  const [score, setScore] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleScore = async (value: number) => {
    if (isSubmitting) return;
    
    const previousScore = score;
    setScore(value); // Optimistic UI
    setIsSubmitting(true);

    try {
      await scoreQuestion(questionId, value);
    } catch (err) {
      console.error("Failed to score question", err);
      setScore(previousScore); // Revert on failure
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0' }}>
      <button 
        onClick={() => handleScore(1)}
        disabled={isSubmitting}
        style={{
          padding: '6px 12px',
          cursor: 'pointer',
          backgroundColor: score === 1 ? '#10b981' : 'transparent',
          color: score === 1 ? 'white' : '#6b7280',
          border: '1px solid',
          borderColor: score === 1 ? '#10b981' : '#d1d5db',
          borderRadius: '6px',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '14px'
        }}
        title="Helpful"
      >
        👍 Helpful
      </button>
      <button 
        onClick={() => handleScore(-1)}
        disabled={isSubmitting}
        style={{
          padding: '6px 12px',
          cursor: 'pointer',
          backgroundColor: score === -1 ? '#ef4444' : 'transparent',
          color: score === -1 ? 'white' : '#6b7280',
          border: '1px solid',
          borderColor: score === -1 ? '#ef4444' : '#d1d5db',
          borderRadius: '6px',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '14px'
        }}
        title="Not Helpful"
      >
        👎 Not Helpful
      </button>
    </div>
  )
}
