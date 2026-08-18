import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Reset Password</h1>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email</label>
            <input type="email" id="email" required style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-sm)', fontSize: '1rem' }} />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: 500, cursor: 'pointer' }}>
            Send link
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/login" style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>Back to login</Link>
        </div>
      </div>
    </div>
  )
}
