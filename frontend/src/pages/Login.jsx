import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: API call
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold text-[var(--color-text)]">Skyline Sports</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-[var(--color-text)]">Sign in</h1>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
              Enter your credentials to access your club dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="email">Work Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@skylinesports.com"
                  className="form-input pl-9"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="form-input pl-9 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                Remember me
              </label>
              <a href="#" className="text-[13px] font-medium text-[var(--color-primary)] hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary w-full justify-center py-2.5">
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[12px] text-[var(--color-text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {/* SSO Buttons */}
          <div className="space-y-2">
            <button className="btn-secondary w-full justify-center py-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button className="btn-secondary w-full justify-center py-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/>
                <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/>
                <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/>
                <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-[13px] text-[var(--color-text-secondary)] mt-5">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-[var(--color-primary)] hover:underline">
              Register your club
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-4">
          Protected by reCAPTCHA Enterprise · Privacy Policy · Terms of Service
        </p>
      </div>
    </div>
  )
}
