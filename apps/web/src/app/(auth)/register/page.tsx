'use client'

import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import styles from './register.module.css'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (authError) {
        setError(authError.message || 'Something went wrong during registration.')
        return
      }

      // If email confirmation is required, session will be null
      if (!data.session) {
        setIsSuccess(true)
        return
      }

      // If email confirmation is off / auto-confirmed, session exists:
      router.push(redirectTarget)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
          <h1 className={styles.title}>Check your email</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            We've sent a verification link to <strong>{email}</strong>. Please confirm your email to activate your account.
          </p>
          <Link 
            href={redirectTarget !== '/dashboard' ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'} 
            className={styles.submitBtn} 
            style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
          >
            Back to Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Create account</h1>
        
        {error && (
          <div className={styles.errorAlert} style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required 
              disabled={isLoading}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href={redirectTarget !== '/dashboard' ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'} className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.formWrapper}><h1 className={styles.title}>Loading...</h1></div></div>}>
      <RegisterForm />
    </Suspense>
  )
}
