import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Trophy } from 'lucide-react'

export default function Login() {
  const navigate  = useNavigate()
  const [show, setShow]   = useState(false)
  const [form, setForm]   = useState({ email: 'admin@skylinesports.com', password: 'password123' })

  const submit = (e) => { e.preventDefault(); navigate('/dashboard') }

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
            <div>
              <label className="form-label">Work Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email" required
                  className="form-input pl-9"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={show ? 'text' : 'password'} required
                  className="form-input pl-9 pr-9"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center py-2.5 text-[13px] mt-2">
              Sign In to Dashboard
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
