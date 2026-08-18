import Link from 'next/link'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.link}>
          <span className={styles.icon}>🏠</span>
          <span className={styles.text}>Dashboard</span>
        </Link>
        <Link href="/explore" className={styles.link}>
          <span className={styles.icon}>🧭</span>
          <span className={styles.text}>Explore</span>
        </Link>
        <Link href="/community" className={styles.link}>
          <span className={styles.icon}>💬</span>
          <span className={styles.text}>Community</span>
        </Link>
        <Link href="/settings" className={styles.link}>
          <span className={styles.icon}>⚙️</span>
          <span className={styles.text}>Settings</span>
        </Link>
      </nav>
    </aside>
  )
}
