'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MailCheck, Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { registerUser } from '../actions'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setServerError('')
    const result = await registerUser(data)

    if (!result.success) {
      setServerError(result.error === 'emailInUse' ? t('emailInUse') : t('genericError'))
      return
    }

    setIsSuccess(true)
  }

  const handleGoogle = () => {
    setIsGoogleLoading(true)
    signIn('google', { callbackUrl: '/account' })
  }

  return (
    <AuthSplitLayout mode="register">
      <div className="w-full flex flex-col items-center">
        
        {/* Floating White Card */}
        <div className="w-full bg-white rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col gap-6">
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C4F088]/20 text-[#7CB736]">
                <MailCheck size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold tracking-tight text-ink">
                  Check your email
                </h1>
                <p className="text-xs text-ink/60 max-w-[280px] mx-auto">
                  {t('successMessage')}
                </p>
              </div>
              <Link href="/login" className="w-full mt-4">
                <button className="w-full bg-[#111] hover:bg-black text-white rounded-xl py-3 text-sm font-medium transition-colors">
                  {t('backToLogin')}
                </button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-center text-ink font-bold text-lg mb-2">
                Create an account
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
                
                {/* Input Group Container */}
                <div className="flex flex-col border border-black/10 rounded-2xl overflow-hidden bg-white">
                  
                  {/* Name Fields (Row) */}
                  <div className="flex w-full">
                    <div className="flex flex-col px-4 py-3 relative flex-1 border-r border-black/5">
                      <label htmlFor="firstName" className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mb-1">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        className="w-full bg-transparent border-none p-0 text-sm font-medium text-ink focus:outline-none focus:ring-0 placeholder:text-ink/20"
                        {...register('firstName')}
                      />
                      {errors.firstName && <span className="text-[10px] text-red-500 absolute right-2 top-4">{errors.firstName.message}</span>}
                    </div>
                    
                    <div className="flex flex-col px-4 py-3 relative flex-1">
                      <label htmlFor="lastName" className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mb-1">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        className="w-full bg-transparent border-none p-0 text-sm font-medium text-ink focus:outline-none focus:ring-0 placeholder:text-ink/20"
                        {...register('lastName')}
                      />
                      {errors.lastName && <span className="text-[10px] text-red-500 absolute right-2 top-4">{errors.lastName.message}</span>}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-black/5" />

                  {/* Email Field */}
                  <div className="flex flex-col px-4 py-3 relative">
                    <label htmlFor="email" className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="john@example.com"
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
                        autoComplete="new-password"
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

                {serverError && (
                  <div className="px-1 -mt-2">
                    <p className="text-xs font-medium text-red-500">{serverError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#111] hover:bg-black text-white rounded-xl py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>
              
              {/* Separator */}
              {!isSuccess && (
                <div className="flex items-center gap-4 px-2 -my-2 w-full mt-2">
                  <div className="h-px flex-1 bg-ink/10" />
                  <span className="text-[10px] font-medium text-ink/40 uppercase tracking-wider">or</span>
                  <div className="h-px flex-1 bg-ink/10" />
                </div>
              )}

              {/* Google Registration */}
              {!isSuccess && (
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
              )}

              {/* Footer Link */}
              {!isSuccess && (
                <div className="flex justify-center items-center gap-1.5 mt-2">
                  <span className="text-xs font-medium text-ink/60">Already have an account?</span>
                  <Link href="/login" className="text-xs font-bold text-ink hover:text-primary transition-colors hover:underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              )}

            </>
          )}
        </div>

      </div>
    </AuthSplitLayout>
  )
}
