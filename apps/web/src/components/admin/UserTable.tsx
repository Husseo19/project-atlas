'use client'

import { useState } from 'react'
import { toggleBypassKey } from '../../app/actions'
import styles from './UserTable.module.css'

interface Profile {
  id: string
  email: string | null
  subscription_plan: string
  is_admin: boolean
  bypass_byo_key: boolean
  created_at: string
}

interface Props {
  initialUsers: Profile[]
}

export default function UserTable({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggleBypass = async (userId: string, currentStatus: boolean) => {
    try {
      setLoadingId(userId)
      const newStatus = !currentStatus
      await toggleBypassKey(userId, newStatus)
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, bypass_byo_key: newStatus } : u
      ))
    } catch (err) {
      console.error('Failed to toggle bypass status:', err)
      alert('Failed to update status')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>User Details</th>
            <th>Role</th>
            <th>Plan</th>
            <th>Joined</th>
            <th>Bypass BYO Key</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className={styles.userDetails}>
                  <div className={styles.email}>{user.email || 'No email available'}</div>
                  <div className={styles.id}>{user.id}</div>
                </div>
              </td>
              <td>
                <span className={`${styles.badge} ${user.is_admin ? styles.badgeAdmin : styles.badgeUser}`}>
                  {user.is_admin ? 'Admin' : 'User'}
                </span>
              </td>
              <td>{user.subscription_plan}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={user.bypass_byo_key}
                    onChange={() => handleToggleBypass(user.id, user.bypass_byo_key)}
                    disabled={loadingId === user.id}
                  />
                  <span className={styles.slider}></span>
                </label>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.empty}>No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
