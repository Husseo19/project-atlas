import { createClient } from '../../../utils/supabase/server'
import styles from './page.module.css'
import ApiKeyForm from '../../../components/ui/ApiKeyForm'
import DarkModeToggle from '../../../components/settings/DarkModeToggle'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name || 'Student'
  const email = user?.email || 'No email provided'

  // Fetch dark mode status
  let darkModeEnabled = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('dark_mode_enabled').eq('id', user.id).single()
    darkModeEnabled = profile?.dark_mode_enabled || false
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Account Settings</h1>
        <p className={styles.subtitle}>Manage your profile and application preferences.</p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Profile Information</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input className={styles.input} type="text" defaultValue={name} disabled />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input className={styles.input} type="email" defaultValue={email} disabled />
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          * Currently, profile updates must be handled through your identity provider.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>API Integrations</h2>
        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
          Configure your external API keys to unlock advanced features like the AI Tutor insights.
        </p>
        <ApiKeyForm />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>"Dark Side" Mode</h2>
        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
          Toggle this switch to unleash the Dark Side. This will apply a dark theme globally and switch all your training sessions to use questions sourced from dumps rather than official materials.
        </p>
        <DarkModeToggle initialEnabled={darkModeEnabled} />
      </section>
    </div>
  )
}
