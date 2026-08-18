'use server'

import { cookies } from 'next/headers'

export async function saveApiKeyAction(apiKey: string) {
  cookies().set('openai_api_key', apiKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  
  return { success: true }
}

export async function getApiKeyAction() {
  const cookieStore = cookies()
  const apiKey = cookieStore.get('openai_api_key')
  return apiKey?.value || null
}
