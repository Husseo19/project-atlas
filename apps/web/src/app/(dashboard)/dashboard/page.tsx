import styles from './page.module.css'
import CertificationFilterList from '../../../components/ui/CertificationFilterList'
import { Certification } from '../../../types'
import Link from 'next/link'
import { cachedSupabase } from '../../../utils/supabase/cached'

import { Suspense } from 'react'
import { createClient } from '../../../utils/supabase/server'
import ReadinessChart from '../../../components/ui/ReadinessChart'
import DashboardTabs from './Tabs'

async function CertificationList({ activeCertIds }: { activeCertIds: string[] }) {
  if (activeCertIds.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p style={{ marginBottom: '16px' }}>You haven't started any certifications yet!</p>
        <Link href="/explore" className={styles.startBtn} style={{ display: 'inline-block' }}>
          Explore Certifications
        </Link>
      </div>
    )
  }

  const { data } = await cachedSupabase
    .from('certifications')
    .select('*')
    .in('id', activeCertIds)
    
  const certs: Certification[] = data || []
  
  return <CertificationFilterList certifications={certs} />
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const analytics = {
    overallMastery: 0,
    examsTaken: 0,
    averageScore: 0,
    readinessScore: 0
  }
  
  let chartData: { name: string, score: number }[] = []

  let activeCertIds: string[] = []

  if (user) {
    // Fetch mastery profiles
    const { data: profiles } = await supabase
      .from('mastery_profiles')
      .select('*')
      .eq('user_id', user.id)
      
    if (profiles) {
      activeCertIds = Array.from(new Set(profiles.map(p => p.certification_id)))
    }
      
    // Fetch sessions
    const { data: sessions } = await supabase
      .from('sessions')
      .select('score, start_time')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true })

    if (profiles && profiles.length > 0) {
      const totalMastery = profiles.reduce((acc, curr) => acc + Number(curr.overall_mastery || 0), 0)
      const totalReadiness = profiles.reduce((acc, curr) => acc + Number(curr.readiness_score || 0), 0)
      
      // Assuming values might be 0.0 to 1.0 or 0 to 100, we'll just format them nicely.
      // If it's <= 1, it's likely a percentage represented as a decimal.
      let avgM = totalMastery / profiles.length
      let avgR = totalReadiness / profiles.length
      
      if (avgM <= 1 && avgM > 0) avgM *= 100
      if (avgR <= 1 && avgR > 0) avgR *= 100
      
      analytics.overallMastery = Math.round(avgM)
      analytics.readinessScore = Math.round(avgR)
    }

    if (sessions && sessions.length > 0) {
      const exams = sessions.filter(s => s.score !== null)
      analytics.examsTaken = exams.length
      if (exams.length > 0) {
        const totalScore = exams.reduce((acc, curr) => acc + Number(curr.score), 0)
        analytics.averageScore = Math.round(totalScore / exams.length)
      }
      
      chartData = exams.slice(-10).map((s, i) => ({
        name: `S${i + 1}`,
        score: Number(s.score)
      }))
    }
  }

  let name = 'Student'
  if (user) {
    name = user.user_metadata?.full_name || user.email || 'Student'
  }

  const { data: certifications } = await supabase.from('certifications').select('*')

  const overviewContent = (
    <>
      <section className={styles.ctaSection} style={{ marginBottom: '24px' }}>
        <div className={styles.ctaCard} style={{ background: '#f9fafb', borderColor: '#e5e7eb' }}>
          <div className={styles.ctaContent}>
            <h2 style={{ fontSize: '16px', color: '#374151' }}>Configure AI Features</h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Add your API keys to unlock personalized AI Tutor insights.</p>
          </div>
          <Link href="/settings" className={styles.startBtn} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db' }}>
            Go to Settings
          </Link>
        </div>
      </section>
      <section className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.overallMastery}%</div>
          <div className={styles.statLabel}>Overall Mastery</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.examsTaken}</div>
          <div className={styles.statLabel}>Exams taken</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.averageScore}%</div>
          <div className={styles.statLabel}>Average score</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{analytics.readinessScore}</div>
          <div className={styles.statLabel}>Readiness Score</div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2>Continue Preparation</h2>
            <p>Pick up where you left off and ace your next exam.</p>
          </div>
          <Link href={`/explore`} className={styles.startBtn}>Explore Certs</Link>
        </div>
      </section>

      <section className={styles.certsSection}>
        <h2 className={styles.sectionTitle}>My Certifications</h2>
        <div style={{ marginTop: '16px' }}>
          <Suspense fallback={<div className={styles.emptyState}>Loading certifications...</div>}>
            <CertificationList activeCertIds={activeCertIds} />
          </Suspense>
        </div>
      </section>

      <section className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <ReadinessChart data={chartData} />
      </section>
    </>
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.welcome}>Good morning, {name}</h1>
        <p className={styles.subtitle}>Ready to continue your learning journey?</p>
      </header>

      <DashboardTabs 
        overviewContent={overviewContent} 
        activeCertIds={activeCertIds} 
        certifications={certifications || []}
      />
    </div>
  )
}
