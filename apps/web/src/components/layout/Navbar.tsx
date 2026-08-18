import styles from './Navbar.module.css'
import Link from 'next/link'

import { createClient } from '../../utils/supabase/server'
import UserDropdown from './UserDropdown'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let name = 'Student'
  if (user) {
    name = user.user_metadata?.full_name || user.email || 'Student'
  }
  
  const initials = name.substring(0, 1).toUpperCase()

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link href="/dashboard" className={styles.logoMark}>
            <div className={styles.logoIcon}>A</div>
            <span className={styles.logoText}>Atlas</span>
          </Link>
        </div>
        
        <div className={styles.links}>
          <Link href="/dashboard" className={styles.link}>Dashboard</Link>
          <Link href="/explore" className={styles.link}>Explore</Link>
          <Link href="/community" className={styles.link}>Community</Link>
        </div>

        <div className={styles.actions}>
          <UserDropdown name={name} initials={initials} />
        </div>
      </div>
    </nav>
  )
}
