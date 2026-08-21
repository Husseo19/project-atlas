import styles from './Navbar.module.css'
import Link from 'next/link'

import { createClient } from '../../utils/supabase/server'
import UserDropdown from './UserDropdown'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let name = ''
  let isAdmin = false
  if (user) {
    name = user.user_metadata?.full_name || user.email || 'User'
    isAdmin = user.email === process.env.ADMIN_EMAIL || user.email === 'husseo19@gmail.com'
  }
  
  const initials = name ? name.substring(0, 1).toUpperCase() : 'U'

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link href={user ? "/dashboard" : "/"} className={styles.logoMark}>
            <div className={styles.logoIcon}>A</div>
            <span className={styles.logoText}>Atlas</span>
          </Link>
        </div>
        
        <div className={styles.links}>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.link}>Dashboard</Link>
              <Link href="/explore" className={styles.link}>Explore</Link>
              <Link href="/community" className={styles.link}>Community</Link>
              {isAdmin && <Link href="/admin" className={styles.link}>Admin</Link>}
            </>
          ) : (
            <>
              <Link href="/explore" className={styles.link}>Certifications</Link>
              <Link href="/pricing" className={styles.link}>Pricing</Link>
            </>
          )}
        </div>

        <div className={styles.actions}>
          {user ? (
            <UserDropdown name={name} initials={initials} />
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.signInBtn}>Sign In</Link>
              <Link href="/register" className={styles.getStartedBtn}>Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
