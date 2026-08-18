'use client'

import { useState } from 'react'
import styles from './Tabs.module.css'
import HistoryTab from '../../../components/dashboard/HistoryTab'

interface Props {
  overviewContent: React.ReactNode
  activeCertIds: string[]
  certifications: any[]
}

export default function DashboardTabs({ overviewContent, activeCertIds, certifications }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
  const [selectedCert, setSelectedCert] = useState<string>(activeCertIds[0] || '')

  return (
    <div>
      <div className={styles.tabHeader}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Performance History
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'overview' && overviewContent}
        
        {activeTab === 'history' && (
          <div>
            {activeCertIds.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
                Complete a training session to see your performance history!
              </p>
            ) : (
              <>
                <div className={styles.certSelector}>
                  <label htmlFor="certSelect">Select Certification: </label>
                  <select 
                    id="certSelect"
                    value={selectedCert} 
                    onChange={(e) => setSelectedCert(e.target.value)}
                    className={styles.select}
                  >
                    {certifications.filter(c => activeCertIds.includes(c.id)).map(cert => (
                      <option key={cert.id} value={cert.id}>
                        {cert.exam_code} - {cert.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedCert && <HistoryTab certificationId={selectedCert} />}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
