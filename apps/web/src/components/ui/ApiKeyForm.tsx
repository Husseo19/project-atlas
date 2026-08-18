'use client'

import { useState, useEffect } from 'react'
import styles from './ApiKeyForm.module.css'
import Button from './Button'
import Input from './Input'

import { saveApiKeyAction, getApiKeyAction } from '../../app/actions/auth'

export default function ApiKeyForm() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadKey() {
      const key = await getApiKeyAction()
      if (key) {
        setApiKey(key)
      }
    }
    loadKey()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveApiKeyAction(apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>BYO API Key</h3>
      <p className={styles.description}>Enter your OpenAI API key to use premium AI features.</p>
      <form onSubmit={handleSave} className={styles.form}>
        <Input 
          label="OpenAI API Key"
          type="password" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)} 
          placeholder="sk-..." 
        />
        <Button type="submit">Save</Button>
      </form>
      {saved && <span className={styles.savedMessage}>API Key saved locally!</span>}
    </div>
  )
}
