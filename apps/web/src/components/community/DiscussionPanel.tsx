'use client'

import { useState, useEffect } from 'react'
import { getComments, postComment, deleteComment, editComment, getCurrentUser } from '../../app/actions'
import styles from './DiscussionPanel.module.css'

interface Comment {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string;
  user_name?: string;
}

interface Props {
  questionId: string;
}

export default function DiscussionPanel({ questionId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const fetchComments = async () => {
    try {
      setLoading(true)
      const [data, userRes] = await Promise.all([
        getComments(questionId),
        getCurrentUser()
      ])
      setComments(data)
      if (userRes) setCurrentUserId(userRes.id)
    } catch (err) {
      console.error("Failed to fetch comments", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isExpanded) {
      fetchComments()
    }
  }, [isExpanded, questionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const comment = await postComment(questionId, newComment)
      setComments([...comments, comment])
      setNewComment('')
    } catch (err) {
      console.error("Failed to post comment", err)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    try {
      await deleteComment(commentId)
      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      console.error("Failed to delete comment", err)
    }
  }

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim()) return
    try {
      const updated = await editComment(commentId, editContent)
      setComments(comments.map(c => c.id === commentId ? updated : c))
      setEditingId(null)
    } catch (err) {
      console.error("Failed to edit comment", err)
    }
  }

  return (
    <div className={styles.container}>
      <button 
        className={styles.toggleBtn} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide Discussion' : `View Discussion (${comments.length > 0 ? comments.length : 'Q&A'})`}
      </button>

      {isExpanded && (
        <div className={styles.panel}>
          <div className={styles.commentsList}>
            {loading ? (
              <p className={styles.loading}>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className={styles.empty}>No discussion yet. Be the first to ask a question!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.author}>{comment.user_name || (comment.user_id.substring(0, 8) + '...')}</span>
                    <span className={styles.date}>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {editingId === comment.id ? (
                    <div style={{ marginTop: '8px' }}>
                      <textarea 
                        className={styles.textarea} 
                        value={editContent} 
                        onChange={e => setEditContent(e.target.value)} 
                        rows={3} 
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button onClick={() => handleEditSubmit(comment.id)} className={styles.submitBtn} style={{ padding: '4px 12px', fontSize: '12px' }}>Save</button>
                        <button onClick={() => setEditingId(null)} className={styles.toggleBtn} style={{ padding: '4px 12px', fontSize: '12px', background: 'transparent', border: '1px solid #d1d5db', color: '#374151' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.content}>{comment.content}</div>
                      {currentUserId === comment.user_id && (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                          <button 
                            onClick={() => { setEditingId(comment.id); setEditContent(comment.content) }} 
                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(comment.id)} 
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
              className={styles.textarea}
              placeholder="Ask a question or share a tip about this scenario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={!newComment.trim()}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
