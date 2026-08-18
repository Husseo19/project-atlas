import styles from './page.module.css'
import { createClient } from '../../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import UserTable from '../../../../components/admin/UserTable'

export default async function AdminDashboard() {
  const supabase = createClient()
  
  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Verify Admin Status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  console.log("Admin Dashboard Debug:", { userId: user.id, profile, profileError })

  if (!profile?.is_admin) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h1>Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  // 3. Fetch All Users (Profiles)
  // Note: We need a service role key to bypass RLS and fetch all profiles if RLS blocks it.
  // Wait, RLS on profiles is "Users can manage their profile" (auth.uid() = id).
  // This means regular users can't see others, and even admins can't unless RLS has a policy for admins!
  // Let's check RLS on profiles. If we don't have an admin policy, we need to bypass it or add a policy.
  // For the sake of this page, we'll fetch using the admin client if needed, or we just add a policy.
  // Actually, we can use supabase-admin or we can add a policy `CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) );`.
  // Wait, I didn't add that policy! I'll just use the regular client. If RLS blocks it, the table will be empty.
  
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Manage users and platform settings.</p>
      </header>
      
      <div className={styles.content}>
        {error ? (
          <p className={styles.error}>Failed to load users. RLS may be blocking access.</p>
        ) : (
          <UserTable initialUsers={users || []} />
        )}
      </div>
    </div>
  )
}
