/**
 * Auth Callback Route
 * Handles OAuth and email confirmation redirects
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    // Prefer NEXT_PUBLIC_SITE_URL, fall back to request origin
    const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
            console.error('Auth Code Exchange Error:', error)
            return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
        }
    }

    // Redirect to home page without the code parameter
    return NextResponse.redirect(origin)
}
