import styles from './page.module.css'
import CertificationFilterList from '../../../components/ui/CertificationFilterList'
import { Certification } from '../../../types'
import { cachedSupabase } from '../../../utils/supabase/cached'
import { Suspense } from 'react'

async function ExploreCertificationList() {
  const { data } = await cachedSupabase.from('certifications').select('*')
  const certs: Certification[] = data || []
  
  if (certs.length === 0) {
    return <div className={styles.emptyState}>No certifications available yet.</div>
  }
  
  return <CertificationFilterList certifications={certs} />
}

export default function ExplorePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Explore Certifications</h1>
        <p className={styles.subtitle}>Discover new paths and advance your career.</p>
      </header>



      <div style={{ marginTop: '24px' }}>
        <Suspense fallback={<div className={styles.emptyState}>Loading certifications...</div>}>
          <ExploreCertificationList />
        </Suspense>
      </div>
    </div>
  )
}
