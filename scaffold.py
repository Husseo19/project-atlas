import os

base_dir = r"c:\Users\Haxker\Desktop\Websites Antigravity\AI Educator\project-atlas\apps\web"

files = {
    "package.json": """{
  "name": "atlas-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.43.4",
    "@supabase/ssr": "^0.3.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.5"
  }
}""",
    "tsconfig.json": """{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}""",
    "next.config.mjs": """/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
""",
    ".env.local.example": """NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
""",
    "src/lib/supabase/client.ts": """import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
""",
    "src/lib/supabase/server.ts": """import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
""",
    "src/types/index.ts": """export interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export type Certification = {
  id: string
  code: string
  name: string
  provider: string
  level: 'Fundamental' | 'Associate' | 'Expert'
  description: string
}
""",
    "src/store/authStore.ts": """import { create } from 'zustand'
import { AuthState } from '../types'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
""",
    "src/app/layout.tsx": """import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atlas | Microsoft Certification Prep',
  description: 'Master Microsoft certifications with Atlas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
""",
    "src/app/globals.css": """:root {
  --color-primary: #0078D4;
  --color-primary-hover: #106EBE;
  --color-primary-light: #EFF6FC;
  --color-text-primary: #323130;
  --color-text-secondary: #605E5C;
  --color-text-placeholder: #A19F9D;
  --color-bg: #FFFFFF;
  --color-bg-subtle: #FAF9F8;
  --color-border: #EDEBE9;
  --color-border-strong: #C8C6C4;
  --color-success: #107C10;
  --color-error: #A4262C;
  --color-warning: #FFB900;
  --color-surface: #FFFFFF;
  --color-overlay: rgba(0,0,0,0.4);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.16);
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --transition: 150ms ease;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body, h1, h2, h3, h4, p, figure, blockquote, dl, dd {
  margin: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
""",
    "src/app/(auth)/login/page.tsx": """import styles from './login.module.css'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sign in</h1>
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required />
          </div>
          <div className={styles.actions}>
            <Link href="/forgot-password" className={styles.link}>Forgot password?</Link>
          </div>
          <button type="submit" className={styles.submitBtn}>Sign in</button>
        </form>
        <p className={styles.footer}>
          Don't have an account? <Link href="/register" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
""",
    "src/app/(auth)/login/login.module.css": """.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  animation: fadeIn var(--transition);
}

.formWrapper {
  width: 100%;
  max-width: 400px;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.inputGroup label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.inputGroup input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: border-color var(--transition);
}

.inputGroup input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.link {
  color: var(--color-primary);
  font-size: 0.875rem;
}

.link:hover {
  text-decoration: underline;
}

.submitBtn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition);
}

.submitBtn:hover {
  background-color: var(--color-primary-hover);
}

.footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}
""",
    "src/app/(auth)/register/page.tsx": """import styles from './register.module.css'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Create account</h1>
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" required />
          </div>
          <button type="submit" className={styles.submitBtn}>Sign up</button>
        </form>
        <p className={styles.footer}>
          Already have an account? <Link href="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
""",
    "src/app/(auth)/register/register.module.css": """.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  animation: fadeIn var(--transition);
}

.formWrapper {
  width: 100%;
  max-width: 400px;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.inputGroup label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.inputGroup input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: border-color var(--transition);
}

.inputGroup input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.link {
  color: var(--color-primary);
  font-size: 0.875rem;
}

.link:hover {
  text-decoration: underline;
}

.submitBtn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition);
}

.submitBtn:hover {
  background-color: var(--color-primary-hover);
}

.footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}
""",
    "src/app/(auth)/forgot-password/page.tsx": """import Link from 'next/link'

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
""",
    "src/app/(auth)/layout.tsx": """import styles from './layout.module.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <div className={styles.branding}>
          <div className={styles.logo}>Atlas</div>
          <p className={styles.tagline}>Master Microsoft certifications</p>
        </div>
        <div className={styles.trustSignals}>
          <p>Trusted by learners worldwide</p>
          <p>10,000+ practice questions</p>
        </div>
      </div>
      <div className={styles.rightPanel}>
        {children}
      </div>
    </div>
  )
}
""",
    "src/app/(auth)/layout.module.css": """.layout {
  display: flex;
  min-height: 100vh;
}

.leftPanel {
  flex: 1;
  background: linear-gradient(135deg, #004578 0%, var(--color-primary) 100%);
  color: white;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  display: none;
}

@media (min-width: 768px) {
  .leftPanel {
    display: flex;
  }
}

.rightPanel {
  flex: 1;
  padding: 2rem;
  background-color: var(--color-bg);
}

.logo {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.tagline {
  font-size: 1.125rem;
  opacity: 0.9;
}

.trustSignals {
  font-size: 0.875rem;
  opacity: 0.8;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
""",
    "src/app/(dashboard)/layout.tsx": """import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import styles from './layout.module.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.mainContainer}>
        <Sidebar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
""",
    "src/app/(dashboard)/layout.module.css": """.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-subtle);
}

.mainContainer {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
""",
    "src/app/(dashboard)/dashboard/page.tsx": """import styles from './page.module.css'
import CertificationCard from '../../../components/ui/CertificationCard'

const certs = [
  { id: '1', code: 'AZ-900', name: 'Microsoft Azure Fundamentals', provider: 'Microsoft', level: 'Fundamental' as const, description: 'Demonstrate foundational knowledge of cloud services and how those services are provided with Microsoft Azure.' },
  { id: '2', code: 'AZ-104', name: 'Microsoft Azure Administrator', provider: 'Microsoft', level: 'Associate' as const, description: 'Manage cloud services that span storage, security, networking, and compute cloud capabilities.' },
  { id: '3', code: 'AZ-305', name: 'Designing Microsoft Azure Infrastructure Solutions', provider: 'Microsoft', level: 'Expert' as const, description: 'Design cloud and hybrid solutions that run on Microsoft Azure, including compute, network, storage, monitoring, and security.' },
  { id: '4', code: 'SC-900', name: 'Microsoft Security, Compliance, and Identity Fundamentals', provider: 'Microsoft', level: 'Fundamental' as const, description: 'Familiarize yourself with the fundamentals of security, compliance, and identity (SCI) across cloud-based and related Microsoft services.' }
]

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.welcome}>Good morning, Student</h1>
        <p className={styles.subtitle}>Ready to continue your learning journey?</p>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>2</div>
          <div className={styles.statLabel}>Certifications enrolled</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>5</div>
          <div className={styles.statLabel}>Exams taken</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>85%</div>
          <div className={styles.statLabel}>Average score</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>3 days</div>
          <div className={styles.statLabel}>Study streak</div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2>Continue AZ-900 Preparation</h2>
            <p>You are 60% through the practice questions.</p>
          </div>
          <button className={styles.startBtn}>Start Studying</button>
        </div>
      </section>

      <section className={styles.certsSection}>
        <h2 className={styles.sectionTitle}>Available Certifications</h2>
        <div className={styles.certsGrid}>
          {certs.map(cert => (
            <CertificationCard key={cert.id} certification={cert} />
          ))}
        </div>
      </section>

      <section className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.emptyState}>
          No recent activity to show.
        </div>
      </section>
    </div>
  )
}
""",
    "src/app/(dashboard)/dashboard/page.module.css": """.container {
  max-width: 1200px;
  margin: 0 auto;
  animation: slideUp var(--transition);
}

.header {
  margin-bottom: 2rem;
}

.welcome {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.subtitle {
  color: var(--color-text-secondary);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.statCard {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.statValue {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.statLabel {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.ctaSection {
  margin-bottom: 2.5rem;
}

.ctaCard {
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ctaContent h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.ctaContent p {
  color: var(--color-text-secondary);
}

.startBtn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition);
}

.startBtn:hover {
  background: var(--color-primary-hover);
}

.certsSection {
  margin-bottom: 2.5rem;
}

.sectionTitle {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.certsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.activitySection {
  margin-bottom: 2.5rem;
}

.emptyState {
  background: var(--color-surface);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: 3rem;
  text-align: center;
  color: var(--color-text-secondary);
}
""",
    "src/components/ui/Button.tsx": """import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.btn,
    styles[variant],
    styles[size],
    isLoading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button className={classNames} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span className={styles.spinner}></span> : children}
    </button>
  )
}
""",
    "src/components/ui/Button.module.css": """.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.primary {
  background-color: var(--color-primary);
  color: white;
}
.primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.secondary {
  background-color: white;
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}
.secondary:hover:not(:disabled) {
  background-color: var(--color-bg-subtle);
}

.ghost {
  background-color: transparent;
  color: var(--color-primary);
}
.ghost:hover:not(:disabled) {
  background-color: var(--color-primary-light);
}

.danger {
  background-color: var(--color-error);
  color: white;
}
.danger:hover:not(:disabled) {
  opacity: 0.9;
}

/* Sizes */
.sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}
.md {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
.lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Loading */
.loading {
  position: relative;
  color: transparent !important;
}

.spinner {
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
""",
    "src/components/ui/Input.tsx": """import React from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export default function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <label className={styles.label}>{label}</label>
      <input
        className={`${styles.input} ${error ? styles.hasError : ''}`}
        {...props}
      />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
""",
    "src/components/ui/Input.module.css": """.container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color var(--transition);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.hasError {
  border-color: var(--color-error);
}

.hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.error {
  font-size: 0.75rem;
  color: var(--color-error);
}
""",
    "src/components/ui/LoadingSpinner.tsx": """import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner() {
  return (
    <div className={styles.spinner}>
      <div className={styles.bounce1}></div>
      <div className={styles.bounce2}></div>
      <div className={styles.bounce3}></div>
    </div>
  )
}
""",
    "src/components/ui/LoadingSpinner.module.css": """.spinner {
  margin: 100px auto 0;
  width: 70px;
  text-align: center;
}

.spinner > div {
  width: 12px;
  height: 12px;
  background-color: var(--color-primary);
  border-radius: 100%;
  display: inline-block;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  margin: 0 2px;
}

.spinner .bounce1 {
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  animation-delay: -0.16s;
}

@keyframes sk-bouncedelay {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1.0);
  }
}
""",
    "src/components/ui/CertificationCard.tsx": """import { Certification } from '../../types'
import Button from './Button'
import styles from './CertificationCard.module.css'

export default function CertificationCard({ certification }: { certification: Certification }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.code}>{certification.code}</span>
        <span className={`${styles.level} ${styles[certification.level.toLowerCase()]}`}>
          {certification.level}
        </span>
      </div>
      <h3 className={styles.name}>{certification.name}</h3>
      <p className={styles.description}>{certification.description}</p>
      <div className={styles.footer}>
        <Button variant="secondary" size="sm">Start</Button>
      </div>
    </div>
  )
}
""",
    "src/components/ui/CertificationCard.module.css": """.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition), box-shadow var(--transition);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.code {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
}

.level {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  border: 1px solid;
}

.fundamental {
  color: var(--color-success);
  border-color: var(--color-success);
  background: #f0fdf4;
}

.associate {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.expert {
  color: var(--color-error);
  border-color: var(--color-error);
  background: #fef2f2;
}

.name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  margin-top: auto;
}
""",
    "src/components/layout/Navbar.tsx": """import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link href="/dashboard" className={styles.logo}>Atlas</Link>
      </div>
      <div className={styles.actions}>
        <div className={styles.avatar}>S</div>
      </div>
    </nav>
  )
}
""",
    "src/components/layout/Navbar.module.css": """.navbar {
  height: 60px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
}
""",
    "src/components/layout/Sidebar.tsx": """import Link from 'next/link'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.active}>Dashboard</Link>
        <Link href="/dashboard" className={styles.link}>My Certifications</Link>
        <Link href="/dashboard" className={styles.link}>Exam History</Link>
        <Link href="/dashboard" className={styles.link}>Settings</Link>
      </nav>
    </aside>
  )
}
""",
    "src/components/layout/Sidebar.module.css": """.sidebar {
  width: 250px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 2rem 0;
  display: none;
}

@media (min-width: 768px) {
  .sidebar {
    display: block;
  }
}

.nav {
  display: flex;
  flex-direction: column;
}

.link, .active {
  padding: 0.75rem 2rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition);
  border-left: 3px solid transparent;
}

.link:hover {
  background-color: var(--color-bg-subtle);
  color: var(--color-text-primary);
}

.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border-left-color: var(--color-primary);
}
""",
    "src/middleware.ts": """import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // To protect routes, we would check session here.
  // For the scaffold, we just let requests pass or add basic logic.
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
""",
    "src/app/page.tsx": """import { redirect } from 'next/navigation'

export default function RootPage() {
  // Simple redirect to login for now
  redirect('/login')
}
""",
    "README.md": """# Atlas Web Frontend

Microsoft Certification Exam preparation platform frontend.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in your Supabase details.

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Successfully created {len(files)} files.")
