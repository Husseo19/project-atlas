'use client'

import { useState } from 'react'
import styles from './QuestionDisplay.module.css'

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  content: string
  type: 'MultipleChoice' | 'MultipleResponse' | 'DragAndDrop' | 'FillInTheBlank'
  options: QuestionOption[]
  explanation?: string
  correct_answers?: string[]
  is_verified?: boolean
  verification_status?: string
  verification_metadata?: {
    confidence_score?: number
    official_citations?: string[]
    discrepancy_detected?: boolean
  }
}

interface Props {
  question: Question
  selectedOptions: string[]
  onOptionSelect: (optionId: string | string[]) => void
}

function renderTextWithImages(text: string) {
  if (!text) return null;
  // Split by our custom [IMAGE: url] token
  const parts = text.split(/\[IMAGE:\s*(.*?)\s*\]/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // It's the captured image URL
      return (
        <img 
          key={index} 
          src={part} 
          alt="Question Graphic" 
          style={{ maxWidth: '100%', height: 'auto', marginTop: '1rem', marginBottom: '1rem', borderRadius: '8px', display: 'block' }} 
        />
      );
    }
    // It's regular text, split by newlines so they render correctly
    return (
      <span key={index}>
        {part.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i !== part.split('\n').length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

export default function QuestionDisplay({ question, selectedOptions, onOptionSelect }: Props) {
  return (
    <div className={styles.container}>
      {question.is_verified && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <span>🛡️</span> Verified Ground-Truth
          {question.verification_metadata?.confidence_score && (
            <span style={{ opacity: 0.8 }}>({(question.verification_metadata.confidence_score * 100).toFixed(0)}% Confidence)</span>
          )}
        </div>
      )}
      <div className={styles.questionContent}>
        {question.type === 'FillInTheBlank' ? (
          <div className={styles.fibContainer} style={{ color: 'var(--color-text-primary)', display: 'block' }}>
            {question.content.includes('___') ? (
              question.content.split('___').map((part, index, array) => {
                if (index === array.length - 1) return <span key={index}>{renderTextWithImages(part)}</span>
                return (
                  <span key={index}>
                    {renderTextWithImages(part)}
                    <select 
                      value={selectedOptions[index] || ''} 
                      onChange={(e) => {
                        const newSelection = [...selectedOptions]
                        newSelection[index] = e.target.value
                        onOptionSelect(newSelection)
                      }}
                      className={styles.fibSelect}
                    >
                      <option value="" disabled>Select...</option>
                      {question.options.map(o => (
                        <option key={o.id} value={o.id}>{o.text}</option>
                      ))}
                    </select>
                  </span>
                )
              })
            ) : (
              <div>
                <div>{renderTextWithImages(question.content)}</div>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(question.correct_answers || ['opt_0']).map((_, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600 }}>Choice {idx + 1}:</span>
                      <select 
                        value={selectedOptions[idx] || ''} 
                        onChange={(e) => {
                          const newSelection = [...selectedOptions]
                          newSelection[idx] = e.target.value
                          onOptionSelect(newSelection)
                        }}
                        className={styles.fibSelect}
                      >
                        <option value="" disabled>Select an option...</option>
                        {question.options.map(o => (
                          <option key={o.id} value={o.id}>{o.text}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <h3>{renderTextWithImages(question.content)}</h3>
        )}
        {question.type === 'MultipleResponse' && (
          <p className={styles.hint}>Select all that apply.</p>
        )}
      </div>

      {question.type !== 'FillInTheBlank' && (
        <div className={styles.optionsList}>
          {question.type === 'DragAndDrop' ? (
            <div className={styles.dndContainer}>
              <p className={styles.dndHint}>Click items in the correct order to place them.</p>
              <div className={styles.dndSlots}>
                {selectedOptions.map((selId, index) => {
                  const opt = question.options.find(o => o.id === selId)
                  return (
                    <div key={selId} className={styles.dndSlot} onClick={() => {
                      const newSelection = selectedOptions.filter(id => id !== selId)
                      onOptionSelect(newSelection)
                    }}>
                      <span className={styles.dndSlotIndex}>{index + 1}.</span> {opt?.text} (Click to remove)
                    </div>
                  )
                })}
              </div>
              <div className={styles.dndAvailable}>
                {question.options.filter(o => !selectedOptions.includes(o.id)).map(option => (
                  <button key={option.id} className={styles.dndOption} onClick={() => {
                    onOptionSelect([...selectedOptions, option.id])
                  }}>
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            question.options.map(option => {
              const isSelected = selectedOptions.includes(option.id)
              
              return (
                <label 
                  key={option.id} 
                  className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                >
                  <div className={styles.inputWrapper}>
                    {question.type === 'MultipleChoice' ? (
                      <input
                        type="radio"
                        name={question.id}
                        checked={isSelected}
                        onChange={() => onOptionSelect(option.id)}
                        className={styles.radio}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onOptionSelect(option.id)}
                        className={styles.checkbox}
                      />
                    )}
                  </div>
                  <div className={styles.optionText}>{option.text}</div>
                </label>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
