'use client'

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react'
import styles from './admin.module.css'
import { uploadSyllabusAction, getAdminCertifications, generateBulkQuestionsAction } from '../../actions'

export default function AdminDashboard() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [generateProgress, setGenerateProgress] = useState(0)
  const [generateTotal, setGenerateTotal] = useState(50)
  const [generateStatus, setGenerateStatus] = useState('')
  const [generateError, setGenerateError] = useState('')
  
  const [certifications, setCertifications] = useState<any[]>([])
  const [selectedCertId, setSelectedCertId] = useState<string>('')

  useEffect(() => {
    getAdminCertifications()
      .then(data => {
        setCertifications(data)
        if (data && data.length > 0) setSelectedCertId(data[0].id)
      })
      .catch(err => console.error("Failed to load certifications", err))
  }, [])

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setUrl('')
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setUrl('')
    }
  }

  const handleUpload = async () => {
    if (!file && !url) return

    setIsUploading(true)
    
    try {
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        
        const data = await uploadSyllabusAction(formData)
        setUploadResult(data)
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/ingest-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.detail || 'Ingestion failed')
        }
        const data = await res.json()
        setUploadResult(data)
      }
    } catch (error: any) {
      alert(`Failed to process syllabus: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerateBank = async (certIdToUse?: string) => {
    const cid = certIdToUse || uploadResult?.certification_id
    if (!cid) return
    
    setIsGenerating(true)
    setGenerateProgress(0)
    setGenerateStatus('🚀 Initializing Enterprise Question Factory & Microsoft Learn RAG...')
    setGenerateError('')

    try {
      setGenerateStatus('Synthesizing authentic multi-type questions (MultipleChoice, MultipleResponse, Hotspots, Sequences)...')
      setGenerateProgress(Math.floor(generateTotal * 0.3))
      
      const res = await generateBulkQuestionsAction({
        certificationId: cid,
        count: generateTotal
      })

      if (res && res.success) {
        setGenerateProgress(generateTotal)
        setGenerateStatus(`✅ Successfully generated ${res.totalGenerated} high-fidelity questions with Microsoft Learn citations!`)
        setTimeout(() => {
          setIsGenerating(false)
        }, 2000)
      } else {
        throw new Error('Bulk generation failed')
      }
    } catch (err: any) {
      console.error("Bulk generation error:", err)
      setGenerateError(err.message || 'Generation failed. Please verify OpenAI API key is set.')
      setIsGenerating(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Manage certifications, upload official syllabuses, and trigger AI question generation.</p>
      </header>

      <section className={styles.uploadSection}>
        <h2 className={styles.sectionTitle}>Bulk Generation (Existing)</h2>
        <p className={styles.sectionDesc}>
          Generate new questions for a certification already in the database.
        </p>
        <div className={styles.generateControls} style={{ marginBottom: '2rem' }}>
          <select 
            className={styles.urlInput} 
            style={{ width: 'auto', flex: 1 }}
            value={selectedCertId}
            onChange={e => setSelectedCertId(e.target.value)}
            disabled={isGenerating}
          >
            {certifications.map(cert => (
              <option key={cert.id} value={cert.id}>{cert.exam_code} - {cert.name}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={generateTotal} 
            onChange={(e) => setGenerateTotal(parseInt(e.target.value) || 50)}
            className={styles.countInput}
            min={1} max={500}
            disabled={isGenerating}
          />
          <button 
            className={styles.btnSuccess} 
            onClick={() => handleGenerateBank(selectedCertId)}
            disabled={isGenerating || !selectedCertId}
          >
            {isGenerating ? 'Generating...' : 'Generate AI Bank'}
          </button>
        </div>

        {isGenerating && !uploadResult && (
          <div className={styles.progressContainer}>
            <div className={styles.progressHeader}>
              <span>{generateStatus}</span>
              <span>{generateProgress} / {generateTotal}</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${(generateProgress / generateTotal) * 100}%` }}
              />
            </div>
            {generateError && <div className={styles.errorText}>{generateError}</div>}
          </div>
        )}
      </section>

      <section className={styles.uploadSection}>
        <h2 className={styles.sectionTitle}>Syllabus Ingestion Engine</h2>
        <p className={styles.sectionDesc}>
          Upload an official Microsoft Exam Study Guide (PDF) or paste a direct link to the PDF. Our AI pipeline will parse the document, extract the core study objectives, and structure them into the database.
        </p>

        <div className={styles.urlInputContainer}>
          <input 
            type="url" 
            placeholder="https://query.prod.cms.rt.microsoft.com/..." 
            className={styles.urlInput}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (e.target.value) setFile(null)
            }}
            disabled={isUploading}
          />
        </div>
        
        <div className={styles.divider}><span>OR</span></div>

        <div 
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''} ${(url && !file) ? styles.disabled : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => { if (!url) fileInputRef.current?.click() }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="application/pdf"
            className={styles.hiddenInput}
            disabled={!!url || isUploading}
          />
          
          <div className={styles.dropZoneContent}>
            {file ? (
              <div className={styles.fileInfo}>
                <svg className={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <>
                <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>Drag & drop a PDF file here, or click to select</p>
              </>
            )}
          </div>
        </div>

        {(file || url) && (
          <div className={styles.actions}>
            <button 
              className={styles.btnSecondary} 
              onClick={() => {
                setFile(null)
                setUrl('')
              }}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              className={styles.btnPrimary} 
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Parsing with AI...' : 'Process Syllabus'}
            </button>
          </div>
        )}
      </section>

      {uploadResult && (
        <section className={styles.resultSection}>
          <div className={styles.resultHeader}>
            <h2 className={styles.sectionTitle}>
              {uploadResult.result?.certification_code || uploadResult.certification_code}: {uploadResult.result?.certification_name || uploadResult.certification_name}
            </h2>
            <div className={styles.generateControls}>
              <input 
                type="number" 
                value={generateTotal} 
                onChange={(e) => setGenerateTotal(parseInt(e.target.value) || 50)}
                className={styles.countInput}
                min={1} max={500}
                disabled={isGenerating}
              />
              <button 
                className={styles.btnSuccess} 
                onClick={() => handleGenerateBank(uploadResult.certification_id)}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Question Bank'}
              </button>
            </div>
          </div>
          
          {isGenerating && (
            <div className={styles.progressContainer}>
              <div className={styles.progressHeader}>
                <span>{generateStatus}</span>
                <span>{generateProgress} / {generateTotal}</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${(generateProgress / generateTotal) * 100}%` }}
                />
              </div>
              {generateError && <div className={styles.errorText}>{generateError}</div>}
            </div>
          )}
          
          <div className={styles.objectivesList}>
            <div className={styles.successMessage}>
              {uploadResult.created 
                ? '✨ New curriculum automatically generated and linked to database.'
                : '✅ Syllabus parsed and linked to existing curriculum.'}
              <br />
              Ready to generate personalized AI questions for {uploadResult.result?.objectives?.length || uploadResult.objectives?.length || 0} objectives.
            </div>
            
            <div className={styles.objectivesGrid}>
              {(uploadResult.result?.objectives || uploadResult.objectives || []).map((obj: any, idx: number) => (
                <div key={idx} className={styles.objectiveCard}>
                  <div className={styles.objectiveHeader}>
                    <span className={styles.objectiveCode}>{obj.code}</span>
                    <span className={styles.objectiveWeight}>{obj.weight}%</span>
                  </div>
                  <p className={styles.objectiveDesc}>{obj.description}</p>
                </div>
              ))}
            </div>

            <details>
              <summary className={styles.rawJsonToggle}>View Raw JSON</summary>
              <pre className={styles.codeBlock}>
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            </details>
          </div>
        </section>
      )}
    </div>
  )
}
