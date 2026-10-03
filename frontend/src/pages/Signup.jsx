import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Trophy, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.firstName.trim())           e.firstName        = 'First name is required'
    if (!form.lastName.trim())            e.lastName         = 'Last name is required'
    if (!form.email.trim())               e.email            = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email      = 'Enter a valid email'
    if (!form.password)                   e.password         = 'Password is required'
    else if (form.password.length < 8)    e.password         = 'Minimum 8 characters'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match'
    if (!form.agree)                      e.agree            = 'You must accept the terms'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    
    setLoading(true)
    
    try {
      // Note: For initial signup, we don't have club info yet
      // We'll navigate to onboarding where they provide club details
      navigate('/onboarding', { state: { accountData: form } })
    } catch (error) {
      setErrors({ general: error.message || 'Signup failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8)           s++
    if (/[A-Z]/.test(p))         s++
    if (/[0-9]/.test(p))         s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#16a34a']

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>

      {/* ── Left panel (branding) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10"
        style={{ background: 'var(--color-primary)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Trophy size={20} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-bold text-white leading-none">Skyline Sports Club</div>
            <div className="text-[11px] text-white/60 mt-0.5">Enterprise Operations</div>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-5">
          <h2 className="text-[26px] font-bold text-white leading-tight">
            One platform.<br />Every operation.
          </h2>
          <p className="text-[13px] text-white/70 leading-relaxed">
            Manage memberships, courts, shop, café, staff and finances from a single configurable dashboard.
          </p>
          <div className="space-y-3 pt-2">
            {[
              'Multi-tenant, isolated club data',
              'Modular — activate only what you need',
              'Role-based access for every staff type',
              'Real-time court & booking management',
              'Integrated shop, café & finance modules',
            ].map(f => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-white/80" />
                <span className="text-[13px] text-white/80 leading-snug">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-white/40">
          Sports Club Management SaaS — PRD v1.0
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-7 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <Trophy size={17} color="#fff" />
            </div>
            <span className="text-[15px] font-bold text-gray-900">Skyline Sports Club</span>
          </div>

          <div className="card p-8">
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">Create your account</h1>
            <p className="text-[13px] text-gray-500 mt-1.5 mb-6">
              Set up your club management platform in minutes.
            </p>

            <form onSubmit={submit} noValidate className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-[12px] text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Marcus"
                      className={`form-input pl-8 ${errors.firstName ? 'border-red-400' : ''}`}
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                    />
                  </div>
                  {errors.firstName && <p className="text-[11px] text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    placeholder="Vance"
                    className={`form-input ${errors.lastName ? 'border-red-400' : ''}`}
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                  />
                  {errors.lastName && <p className="text-[11px] text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Work Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="marcus@skylinesports.com"
                    className={`form-input pl-8 ${errors.email ? 'border-red-400' : ''}`}
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className={`form-input pl-8 pr-9 ${errors.password ? 'border-red-400' : ''}`}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5">
                    {show ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? strengthColor[strength] : '#e5e7eb' }} />
                      ))}
                    </div>
                    <p className="text-[11px] mt-1 font-medium" style={{ color: strengthColor[strength] }}>
                      {strengthLabel[strength]}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="form-label">Confirm Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    className={`form-input pl-8 pr-9 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5">
                    {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 accent-[var(--color-primary)] flex-shrink-0"
                    checked={form.agree}
                    onChange={e => set('agree', e.target.checked)}
                  />
                  <span className="text-[12px] text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="font-semibold text-[var(--color-primary)] hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="font-semibold text-[var(--color-primary)] hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {errors.agree && <p className="text-[11px] text-red-500 mt-1 ml-6">{errors.agree}</p>}
              </div>

              <button type="submit" className="btn btn-primary w-full justify-center py-2.5 text-[13px] mt-2" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Set Up Club'
                )}
              </button>
            </form>

            <p className="text-center text-[12px] text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Sign in</Link>
            </p>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-5">
            Skyline Sports Club © 2026 · 256-bit SSL Encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
