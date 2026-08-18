import styles from './layout.module.css'
import Navbar from '../../components/layout/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.contentWrapper}>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}
