import styles from './CertificationCard.module.css'
import { Certification } from '../../types'
import Link from 'next/link'

interface Props {
  certification: Certification
}

export default function CertificationCard({ certification }: Props) {
  const badgeClass = 
    certification.level === 'Fundamental' ? styles.badgeFundamental :
    certification.level === 'Associate' ? styles.badgeAssociate :
    styles.badgeExpert

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.code}>{(certification as any).exam_code || certification.code}</div>
        <div className={`${styles.level} ${badgeClass}`}>
          {certification.level}
        </div>
      </div>
      
      <h3 className={styles.title}>{certification.name}</h3>
      <p className={styles.description}>{certification.description}</p>
      
      <div className={styles.footer}>
        <div className={styles.provider}>{certification.provider}</div>
        <div className={styles.actions}>
          <Link href={`/training/${certification.id}`} className={styles.btnSecondary}>
            Training
          </Link>
          <Link href={`/exam/${certification.id}`} className={styles.startBtn}>
            Exam
          </Link>
        </div>
      </div>
    </div>
  )
}
