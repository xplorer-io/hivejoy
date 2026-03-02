import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDisposableEmail, isEmailFormat } from '@/lib/auth/disposable-email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const emailOrPhone = typeof body?.emailOrPhone === 'string' ? body.emailOrPhone.trim() : ''

    if (!emailOrPhone) {
      return NextResponse.json(
        { success: false, message: 'Email or phone number is required.' },
        { status: 400 }
      )
    }

    const isEmail = isEmailFormat(emailOrPhone)
    const supabase = await createClient()

    if (isEmail) {
      if (isDisposableEmail(emailOrPhone)) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Please use a permanent email address. Temporary or disposable email addresses are not allowed.',
          },
          { status: 400 }
        )
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: emailOrPhone,
        options: { shouldCreateUser: true },
      })

      if (error) {
        const code = typeof (error as { code?: string }).code === 'string' ? (error as { code?: string }).code : undefined
        const status = typeof (error as { status?: number }).status === 'number' ? (error as { status?: number }).status : undefined
        const isProfileTriggerFailure =
          code !== undefined || status !== undefined
            ? code === '23505' || status === 422
            : error.message.includes('Database error') || error.message.includes('updating user')

        if (isProfileTriggerFailure) {
          return NextResponse.json(
            { success: true, message: 'OTP sent successfully. Please check your email.' },
            { status: 200 }
          )
        }
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          return NextResponse.json(
            { success: false, message: 'Too many requests. Please wait a few minutes before trying again.' },
            { status: 429 }
          )
        }
        return NextResponse.json(
          { success: false, message: error.message || 'Something went wrong. Please try again.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: true, message: 'OTP sent successfully. Please check your email.' },
        { status: 200 }
      )
    }

    // Phone OTP
    const { error } = await supabase.auth.signInWithOtp({
      phone: emailOrPhone,
      options: { shouldCreateUser: true },
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to send OTP.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'OTP sent successfully' },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send OTP'
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    )
  }
}
