'use client'

import React, { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Space_Grotesk } from 'next/font/google'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { resendVerificationEmail } from '@/app/[locale]/(auth)/register/resendVerification'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '700'] })

function LoginForm() {
  const t = useTranslations('auth.login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account'
  const [serverError, setServerError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setServerError('')
    setUnverifiedEmail('')
    setResendState('idle')
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl,
    })

    if (!result || result.error) {
      if (result?.error === 'EMAIL_NOT_VERIFIED') {
        setServerError(t('emailNotVerified') || "Please verify your email before logging in.")
        setUnverifiedEmail(data.email)
      } else if (result?.error === 'TOO_MANY_ATTEMPTS') {
        setServerError(t('tooManyAttempts') || 'Too many attempts. Please wait a few minutes and try again.')
      } else {
        setServerError(t('invalidCredentials'))
      }
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return
    setResendState('sending')
    await resendVerificationEmail(unverifiedEmail)
    setResendState('sent')
  }

  const handleGoogle = () => {
    setIsGoogleLoading(true)
    signIn('google', { callbackUrl })
  }

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Floating White Card */}
      <div className="w-full bg-white rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col gap-6">
        
        <h2 className="text-center text-ink font-bold text-lg mb-4">
          Login to your account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
          
          {/* Input Group Container */}
          <div className="flex flex-col border border-black/10 rounded-2xl overflow-hidden bg-white">
            
            {/* Email Field */}
            <div className="flex flex-col px-4 py-3 relative">
              <label htmlFor="email" className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mb-1">
                Username / Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Jackob blonde"
                className="w-full bg-transparent border-none p-0 text-sm font-medium text-ink focus:outline-none focus:ring-0 placeholder:text-ink/20"
                {...register('email')}
              />
              {errors.email && <span className="text-[10px] text-red-500 absolute right-4 top-4">{errors.email.message}</span>}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-black/5" />

            {/* Password Field */}
            <div className="flex flex-col px-4 py-3 relative">
              <label htmlFor="password" className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className="w-full bg-transparent border-none p-0 text-sm font-medium text-ink focus:outline-none focus:ring-0 placeholder:text-ink/20"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="text-ink/40 hover:text-ink transition-colors px-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] text-red-500 absolute right-12 top-4">{errors.password.message}</span>}
            </div>

          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-[4px] border ${rememberMe ? 'bg-[#84D0D9] border-[#84D0D9]' : 'bg-transparent border-black/20 group-hover:border-black/40'} flex items-center justify-center transition-colors`}>
                {rememberMe && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                )}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span className="text-xs font-medium text-ink/80">Remember me</span>
            </label>
            
            <Link href="/forgot-password" className="text-xs font-medium text-ink/40 hover:text-ink transition-colors">
              Forgot your password?
            </Link>
          </div>

          {serverError && (
            <div className="flex flex-col gap-1 px-1">
              <p className="text-xs font-medium text-red-500">{serverError}</p>
              {unverifiedEmail && (
                resendState === 'sent' ? (
                  <p className="text-[10px] text-ink/60">
                    A new verification email is on its way — check your inbox.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendState === 'sending'}
                    className="text-[10px] font-bold text-ink hover:underline self-start disabled:opacity-50"
                  >
                    {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
                  </button>
                )
              )}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#111] hover:bg-black text-white rounded-xl py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? 'Logging in...' : 'login'}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center gap-4 px-2 -my-2">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-[10px] font-medium text-ink/40 uppercase tracking-wider">or</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isGoogleLoading}
          className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl py-3.5 flex items-center justify-center gap-3 transition-all text-sm font-semibold shadow-sm hover:shadow"
        >
          {!isGoogleLoading && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Footer Link */}
        <div className="flex justify-center items-center gap-1.5 mt-2">
          <span className="text-xs font-medium text-ink/60">Don't have an account?</span>
          <Link href="/register" className="text-xs font-bold text-ink hover:text-primary transition-colors hover:underline underline-offset-4">
            Create account
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthSplitLayout mode="login">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  )
}
