/**
 * Auth Callback Route
 * Handles OAuth and email confirmation redirects
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectPath = requestUrl.searchParams.get('redirect')
    // Always use the request origin so it stays on localhost in dev
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
            console.error('Auth Code Exchange Error:', error)
            return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
        }
    }

    // Redirect to the intended page, or home page by default
    const destination = redirectPath ? `${origin}${redirectPath}` : origin
    return NextResponse.redirect(destination)
}
