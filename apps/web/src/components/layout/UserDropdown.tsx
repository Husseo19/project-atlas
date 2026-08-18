'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import styles from './UserDropdown.module.css'
import { logout } from '../../app/actions'

interface UserDropdownProps {
  name: string
  initials: string
}

export default function UserDropdown({ name, initials }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={styles.userMenu} ref={dropdownRef}>
      <div 
        className={styles.userMenu} 
        style={{ padding: 0 }} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.avatar}>{initials}</div>
        <span className={styles.userName}>{name}</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <Link 
            href="/settings" 
            className={styles.dropdownItem}
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <button 
            className={`${styles.dropdownItem} ${styles.logoutBtn}`}
            onClick={() => {
              setIsOpen(false)
              logout()
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
