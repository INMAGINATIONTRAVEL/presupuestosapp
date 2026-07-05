import { createClient } from '@supabase/supabase-js'

// Cliente con service role — bypassa RLS, solo usar en server-side API routes
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
