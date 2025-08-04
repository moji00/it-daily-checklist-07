import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple hash function for password verification (in production, use proper bcrypt)
async function hashPassword(password: string): Promise<string> {
  const hash = await createHash("sha256");
  hash.update(password);
  return hash.toString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Clean username
    const cleanUsername = username.trim().toLowerCase()
    
    // Hash the provided password
    const hashedPassword = await hashPassword(password)

    // Check if user exists with matching username and password
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', cleanUsername)
      .eq('password_hash', hashedPassword)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid username or password' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate a simple session token (in production, use proper JWT)
    const sessionToken = crypto.randomUUID()
    
    // Create session data
    const sessionData = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      sessionToken: sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: sessionData,
        message: `Welcome back, ${user.full_name || user.username}!`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Authentication error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})