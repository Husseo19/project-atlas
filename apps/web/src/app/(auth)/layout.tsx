import styles from './layout.module.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <div className={styles.branding}>
          <div className={styles.logoMark}>
            <div className={styles.logoIcon}>A</div>
            <span className={styles.logoText}>Atlas</span>
          </div>

          <h1 className={styles.headline}>
            Master Microsoft<br />
            <span>Certifications</span><br />
            with AI
          </h1>
          <p className={styles.subheadline}>
            Adaptive learning, AI-generated practice questions,
            and real exam simulations — all in one place.
          </p>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🎯</span>
              <div className={styles.statInfo}>
                <div className={styles.statNumber}>10,000+</div>
                <div className={styles.statLabel}>AI-generated practice questions</div>
              </div>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>📈</span>
              <div className={styles.statInfo}>
                <div className={styles.statNumber}>89%</div>
                <div className={styles.statLabel}>Average learner pass rate</div>
              </div>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🏆</span>
              <div className={styles.statInfo}>
                <div className={styles.statNumber}>4 Certifications</div>
                <div className={styles.statLabel}>AZ-900, AZ-104, AZ-305, SC-900</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.certLogos}>
          <span className={styles.certBadge}>AZ-900</span>
          <span className={styles.certBadge}>AZ-104</span>
          <span className={styles.certBadge}>AZ-305</span>
          <span className={styles.certBadge}>SC-900</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightPanel}>
        {children}
      </div>
    </div>
  )
}
