import styles from './layout.module.css'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.contentWrapper}>
        <Sidebar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}

