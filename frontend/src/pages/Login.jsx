import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', role: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const loginPayload = {
        email: form.email.trim(),
        password: form.password,
        ...(form.role ? { role: form.role } : {}),
      };
      const result = await login(loginPayload)
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setErrors({ general: result.message || 'Login failed. Please try again.' })
      }
    } catch (error) {
      setErrors({ 
        general: error.message || 'An error occurred. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="card p-8 shadow-md">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-primary)' }}
            >
              <Trophy size={18} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-gray-900 leading-none">Skyline Sports Club</div>
              <div className="text-[11px] text-gray-400 mt-1">Enterprise Operations</div>
            </div>
          </div>

          <h1 className="text-[18px] font-bold text-gray-900 mb-1.5">Staff & Admin Sign In</h1>
          <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">
            Authenticate to access your club operations dashboard.
          </p>

          <form onSubmit={submit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[12px] text-red-600">{errors.general}</p>
              </div>
            )}

            <div>
              <label className="form-label">Work Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email" 
                  required
                  className="form-input pl-9"
                  placeholder="your.email@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={show ? 'text' : 'password'} 
                  required
                  className="form-input pl-9 pr-9"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  disabled={loading}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full justify-center py-2.5 text-[13px] mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[var(--color-primary)] hover:underline">
            Create one free
          </Link>
        </p>
        <p className="text-center text-[11px] text-gray-400 mt-3">
          Skyline Sports Club © 2026 · 256-bit SSL Encrypted
        </p>
      </div>
    </div>
  )
}
