import { createClient } from '@supabase/supabase-js'

// We create a standard Supabase client with Next.js fetch caching enabled
// This bypasses cookies() so it doesn't force dynamic rendering
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const cachedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        next: { revalidate: 0 } // Disable caching to ensure real-time data
      })
    }
  }
})
