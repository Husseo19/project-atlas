'use client'

import { useState } from 'react'
import { Certification } from '../../types'
import CertificationCard from './CertificationCard'

interface Props {
  certifications: Certification[]
}

export default function CertificationFilterList({ certifications }: Props) {
  const [search, setSearch] = useState('')

  const filteredCerts = certifications.filter(cert => {
    const term = search.toLowerCase()
    return (
      (cert.name || '').toLowerCase().includes(term) ||
      ((cert as any).exam_code || cert.code || '').toLowerCase().includes(term)
    )
  })

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by shortname (e.g. SC-300) or fullname..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '15px'
          }}
        />
      </div>

      {filteredCerts.length === 0 ? (
        <div style={{ color: '#6b7280', padding: '24px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px' }}>
          No certifications found matching "{search}".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredCerts.map(cert => (
            <CertificationCard key={cert.id} certification={cert} />
          ))}
        </div>
      )}
    </div>
  )
}
