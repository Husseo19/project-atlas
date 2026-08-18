'use server'

import { cookies } from 'next/headers'
import { createClient } from '../../utils/supabase/server'

export async function toggleDarkMode(enabled: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const cookieStore = cookies()
  if (enabled) {
    cookieStore.set('theme', 'dark', { path: '/' })
  } else {
    cookieStore.set('theme', 'light', { path: '/' })
  }
  
  if (user) {
    await supabase.from('profiles').update({ dark_mode_enabled: enabled }).eq('id', user.id)
  }
  
  return { success: true }
}
