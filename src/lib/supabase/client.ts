import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only validate in runtime, not during build or static generation
const isClientSide = typeof window !== 'undefined'
const hasValidEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only warn on client-side, never during build/static generation
if (isClientSide && !hasValidEnv) {
  console.warn('Missing Supabase environment variables - using fallback mode')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'tli-connect'
    }
  }
})

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  const actualUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  
  // Only validate on client-side
  if (isClientSide && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY environment variable - using fallback mode')
  }
  
  return createClient(actualUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    }
  })
}