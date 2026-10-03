import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Trophy, Building2, LayoutGrid, Sliders, Users, Send, CheckCircle,
  ChevronRight, ChevronLeft, MapPin, Phone, Globe, Upload,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { clubService } from '../services/clubService'

/* ── Step definitions ─────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Create Club',       icon: Building2  },
  { id: 2, label: 'Select Modules',    icon: LayoutGrid },
  { id: 3, label: 'Configure Features',icon: Sliders    },
  { id: 4, label: 'Configure Roles',   icon: Users      },
  { id: 5, label: 'Invite Staff',      icon: Send       },
  { id: 6, label: 'Review & Launch',   icon: CheckCircle},
]

/* ── Available modules (from PRD §5) ──────────────────────── */
const ALL_MODULES = [
  { id: 'membership',  label: 'Membership',          desc: 'Member registration, plans, validity, renewals, history, benefits and discounts.',    icon: '👤' },
  { id: 'courts',      label: 'Courts & Bookings',   desc: 'Court availability, bookings, cancellations, pricing and social play.',               icon: '🎾' },
  { id: 'shop',        label: 'Shop & Inventory',    desc: 'Products, stock, low-stock alerts, counter and online orders.',                        icon: '🛍️' },
  { id: 'cafe',        label: 'Cafe / Bar',          desc: 'Menu, tables, orders, kitchen workflow, billing and payments.',                        icon: '☕' },
  { id: 'website',     label: 'Public Website',      desc: 'Club information, plans, court availability, shop, trials and enquiries.',             icon: '🌐' },
  { id: 'enquiries',   label: 'Enquiries / CRM',     desc: 'Lead capture, assignment, follow-ups, quotations and conversion.',                    icon: '📋' },
  { id: 'staff',       label: 'Staff / HR',          desc: 'Employees, roles, shifts, attendance and leave.',                                     icon: '👥' },
  { id: 'finance',     label: 'Finance & Accounting',desc: 'Revenue, invoices, payments, expenses and taxes.',                                    icon: '💰' },
  { id: 'clients',     label: 'Business Clients',    desc: 'Corporate accounts, quotations, invoices and outstanding balances.',                   icon: '🏢' },
  { id: 'reports',     label: 'Reports',             desc: 'Operational, membership, court, shop, cafe, HR and financial analytics.',              icon: '📊' },
  { id: 'notifications',label:'Notifications',       desc: 'Expiry, booking, stock, order, enquiry and HR notifications.',                        icon: '🔔' },
]

/* ── Sub-features per module (PRD §6.1) ──────────────────── */
const MODULE_FEATURES = {
  membership:  ['Member Registration', 'Membership Plans', 'Renewals & Expiry', 'Benefits & Discounts', 'Payment History'],
  courts:      ['Court Management', 'Online Booking', 'Walk-in Booking', 'Social Play', 'Member Pricing', 'Cancellations', 'Booking Notifications'],
  shop:        ['Product Catalogue', 'Inventory Tracking', 'Low-Stock Alerts', 'Counter Sales', 'Online Orders', 'Home Delivery', 'Click & Collect'],
  cafe:        ['Menu Management', 'Table Management', 'Customer Tabs', 'Kitchen Workflow', 'Member Discounts', 'Billing & Payments'],
  website:     ['Home Page', 'Membership Plans Page', 'Court Availability', 'Shop Page', 'Trial Booking', 'Enquiry Form'],
  enquiries:   ['Lead Capture', 'Staff Assignment', 'Follow-up Dates', 'Quotations', 'Enquiry Conversion'],
  staff:       ['Employee Profiles', 'Departments', 'Shifts & Schedules', 'Attendance', 'Leave Management', 'Payroll Info'],
  finance:     ['Revenue Tracking', 'Invoices', 'Payments', 'Expenses', 'Tax Management', 'Outstanding Balances'],
  clients:     ['Company Profiles', 'Contacts', 'Quotations', 'Invoices', 'Payment Tracking'],
  reports:     ['Membership Reports', 'Court Utilisation', 'Shop & Inventory', 'Cafe Reports', 'HR Reports', 'Financial Reports'],
  notifications:['Membership Expiry', 'Booking Confirmations', 'Low Stock Alerts', 'Order Updates', 'Leave Decisions', 'Payment Events'],
}

/* ── Default role templates (PRD §8.1) ──────────────────── */
const DEFAULT_ROLES = [
  { id: 'owner',        label: 'Super Admin / Owner', desc: 'Full access to all modules, settings and reports.',          perms: ['All Permissions'] },
  { id: 'receptionist', label: 'Receptionist',         desc: 'Members, bookings, walk-ins and enquiries.',                perms: ['members.*', 'bookings.view', 'bookings.create', 'enquiries.manage'] },
  { id: 'court_mgr',    label: 'Court Manager',        desc: 'Courts, availability, bookings and social play.',           perms: ['courts.*', 'bookings.*'] },
  { id: 'shop_mgr',     label: 'Shop Manager',         desc: 'Products, inventory and shop orders.',                     perms: ['shop.*', 'inventory.*'] },
  { id: 'bar_staff',    label: 'Bar Staff',            desc: 'Tables, orders, billing and payments.',                    perms: ['cafe.orders.*', 'cafe.billing.*'] },
  { id: 'kitchen',      label: 'Kitchen Staff',        desc: 'Kitchen order preparation workflow only.',                  perms: ['cafe.kitchen.*'] },
  { id: 'hr_mgr',       label: 'HR Manager',           desc: 'Employees, shifts, attendance and leave.',                 perms: ['staff.*'] },
  { id: 'accountant',   label: 'Accountant',           desc: 'Invoices, payments, expenses and finance.',                perms: ['finance.*'] },
]

/* ── Country dial codes ─────────────────────────────────── */
const COUNTRY_DIAL_CODES = [
  { code: '+91',  country: 'IN', label: 'IN (+91)' },
  { code: '+1',   country: 'US', label: 'US (+1)' },
  { code: '+44',  country: 'GB', label: 'UK (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+65',  country: 'SG', label: 'SG (+65)' },
  { code: '+61',  country: 'AU', label: 'AU (+61)' },
  { code: '+49',  country: 'DE', label: 'DE (+49)' },
  { code: '+33',  country: 'FR', label: 'FR (+33)' },
  { code: '+966', country: 'SA', label: 'SA (+966)' },
  { code: '+974', country: 'QA', label: 'QA (+974)' },
  { code: '+60',  country: 'MY', label: 'MY (+60)' },
  { code: '+64',  country: 'NZ', label: 'NZ (+64)' },
  { code: '+81',  country: 'JP', label: 'JP (+81)' },
]

/* ══════════════════════════════════════════════════════════ */
export default function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup } = useAuth()
  const [step, setStep] = useState(1)
  const [club, setClub] = useState({ name:'', sport:'', address:'', phoneCode:'+91', phone:'', website:'', country:'India' })
  const [modules, setModules] = useState(['membership','courts'])
  const [features, setFeatures] = useState({})
  const [roles, setRoles] = useState(['owner','receptionist','court_mgr'])
  const [invites, setInvites] = useState([{ email:'', role:'receptionist' }])
  const [clubErr, setClubErr] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get account data from signup
  const accountData = location.state?.accountData

  useEffect(() => {
    if (!accountData) {
      // If no account data, redirect to signup
      navigate('/signup')
    }
  }, [accountData, navigate])

  /* ── helpers ── */
  const toggleModule = (id) =>
    setModules(m => m.includes(id) ? m.filter(x => x !== id) : [...m, id])

  const toggleFeature = (modId, feat) =>
    setFeatures(f => {
      const s = new Set(f[modId] || MODULE_FEATURES[modId])
      s.has(feat) ? s.delete(feat) : s.add(feat)
      return { ...f, [modId]: s }
    })

  const allFeatsOn = (modId) => {
    const s = features[modId]
    return !s || s.size === MODULE_FEATURES[modId].length
  }

  const toggleAllFeats = (modId) =>
    setFeatures(f => ({
      ...f,
      [modId]: allFeatsOn(modId) ? new Set() : new Set(MODULE_FEATURES[modId]),
    }))

  const toggleRole = (id) =>
    setRoles(r => id === 'owner' ? r : r.includes(id) ? r.filter(x => x !== id) : [...r, id])

  const addInvite = () => setInvites(i => [...i, { email:'', role:'receptionist' }])
  const removeInvite = (i) => setInvites(inv => inv.filter((_, idx) => idx !== i))
  const setInvite = (i, field, val) =>
    setInvites(inv => inv.map((x, idx) => idx === i ? { ...x, [field]: val } : x))

  const validateClub = () => {
    const e = {}
    if (!club.name.trim())  e.name  = 'Club name is required'
    if (!club.sport.trim()) e.sport = 'Primary sport is required'
    setClubErr(e)
    return !Object.keys(e).length
  }

  const next = async () => {
    if (step === 1 && !validateClub()) return
    if (step < STEPS.length) setStep(s => s + 1)
    else {
      // Final step - create club
      await createClub()
    }
  }

  const createClub = async () => {
    setLoading(true)
    setError(null)

    try {
      // Prepare signup data
      const signupData = {
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        email: accountData.email,
        password: accountData.password,
        confirmPassword: accountData.confirmPassword,
        clubName: club.name,
        clubAddress: club.address,
        clubEmail: club.email || accountData.email,
        clubPhone: `${club.phoneCode} ${club.phone}`,
        clubWebsite: club.website,
        sport: club.sport,
        country: club.country,
      }

      const result = await signup(signupData)

      if (result.success) {
        // Update modules if different from default
        const selectedModules = {
          membership: modules.includes('membership'),
          courtBooking: modules.includes('courts'),
          shop: modules.includes('shop'),
          bar: modules.includes('cafe'),
          hr: modules.includes('staff'),
          accounting: modules.includes('finance'),
        }

        // Only update if not all enabled
        const allEnabled = Object.values(selectedModules).every(v => v)
        if (!allEnabled) {
          try {
            await clubService.updateModules(selectedModules)
          } catch (error) {
            // Module update failed, but account created - continue anyway
            console.error('Module update failed:', error)
          }
        }

        navigate('/dashboard')
      } else {
        setError(result.message || 'Failed to create club. Please try again.')
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const back = () => { if (step > 1) setStep(s => s - 1) }

  /* ── Step progress bar ── */
  const renderProgress = () => (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, idx) => {
        const Icon = s.icon
        const done    = step > s.id
        const current = step === s.id
        return (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 text-[12px] font-bold',
                  done    ? 'bg-emerald-500 text-white'   : '',
                  current ? 'text-white'                  : '',
                  !done && !current ? 'bg-gray-100 text-gray-400' : '',
                ].join(' ')}
                style={current ? { background: 'var(--color-primary)' } : {}}
              >
                {done ? <CheckCircle size={16} /> : <Icon size={15} />}
              </div>
              <span className={[
                'text-[10px] mt-1 font-medium text-center leading-tight hidden sm:block',
                current ? 'text-[var(--color-primary)]' : done ? 'text-emerald-600' : 'text-gray-400',
              ].join(' ')}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1 mt-0 sm:-mt-4"
                style={{ background: step > s.id ? '#10b981' : '#e5e7eb' }} />
            )}
          </div>
        )
      })}
    </div>
  )

  /* ── Step 1: Create Club ── */
  const renderStepClub = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-gray-900">Club Information</h2>
        <p className="text-[13px] text-gray-500 mt-1">Tell us about your sports club.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="sm:col-span-2">
          <label className="form-label">Club Name *</label>
          <input className={`form-input ${clubErr.name ? 'border-red-400' : ''}`}
            placeholder="Skyline Sports Club"
            value={club.name} onChange={e => { setClub(c=>({...c,name:e.target.value})); setClubErr(er=>({...er,name:undefined})) }} />
          {clubErr.name && <p className="text-[11px] text-red-500 mt-1">{clubErr.name}</p>}
        </div>
        <div>
          <label className="form-label">Primary Sport *</label>
          <select className={`form-input ${clubErr.sport ? 'border-red-400' : ''}`}
            value={club.sport} onChange={e => { setClub(c=>({...c,sport:e.target.value})); setClubErr(er=>({...er,sport:undefined})) }}>
            <option value="">Select sport…</option>
            {['Badminton','Tennis','Squash','Padel','Cricket','Football','Multi-Sport'].map(s=>
              <option key={s}>{s}</option>)}
          </select>
          {clubErr.sport && <p className="text-[11px] text-red-500 mt-1">{clubErr.sport}</p>}
        </div>
        <div>
          <label className="form-label">Country</label>
          <select className="form-input" value={club.country} onChange={e=>setClub(c=>({...c,country:e.target.value}))}>
            {['India','United Kingdom','UAE','Singapore','Australia','Other'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Club Address</label>
          <div className="relative">
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input className="form-input pl-8" placeholder="123, Sport Street, Mumbai — 400001"
              value={club.address} onChange={e=>setClub(c=>({...c,address:e.target.value}))} />
          </div>
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <div className="flex gap-2">
            <select
              className="form-input w-[105px] flex-shrink-0 text-[12px] px-2"
              value={club.phoneCode || '+91'}
              onChange={e => setClub(c => ({ ...c, phoneCode: e.target.value }))}
            >
              {COUNTRY_DIAL_CODES.map(item => (
                <option key={`${item.country}-${item.code}`} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="tel"
                className="form-input pl-8"
                placeholder="98765 43210"
                value={club.phone}
                onChange={e => setClub(c => ({ ...c, phone: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="form-label">Website (optional)</label>
          <div className="relative">
            <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input className="form-input pl-8" placeholder="https://skylinesports.com"
              value={club.website} onChange={e=>setClub(c=>({...c,website:e.target.value}))} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Club Logo (optional)</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer">
            <Upload size={20} className="mx-auto text-gray-400 mb-2" />
            <p className="text-[12px] text-gray-500">Click to upload or drag & drop</p>
            <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG up to 2 MB</p>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Step 2: Select Modules ── */
  const renderStepModules = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-gray-900">Select Modules</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          Activate only the modules your club needs. You can change these later in Settings.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {ALL_MODULES.map(m => {
          const active = modules.includes(m.id)
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleModule(m.id)}
              className={[
                'text-left p-4 rounded-xl border-2 transition-all duration-150',
                active
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-[20px] leading-none flex-shrink-0 mt-0.5">{m.icon}</span>
                  <div className="min-w-0">
                    <div className={`text-[13px] font-semibold leading-tight ${active ? 'text-[var(--color-primary)]' : 'text-gray-900'}`}>
                      {m.label}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{m.desc}</div>
                  </div>
                </div>
                <div className={[
                  'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
                  active ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300',
                ].join(' ')}>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <p className="text-[12px] text-gray-400">{modules.length} module{modules.length !== 1 ? 's' : ''} selected</p>
    </div>
  )

  /* ── Step 3: Configure Features ── */
  const renderStepFeatures = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-gray-900">Configure Features</h2>
        <p className="text-[13px] text-gray-500 mt-1">Choose the sub-features to enable within each module.</p>
      </div>
      <div className="space-y-4 pt-2">
        {modules.map(modId => {
          const mod  = ALL_MODULES.find(m => m.id === modId)
          const feats = MODULE_FEATURES[modId] || []
          const active = features[modId] || new Set(feats)
          return (
            <div key={modId} className="card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-[18px]">{mod?.icon}</span>
                  <span className="text-[14px] font-semibold text-gray-900">{mod?.label}</span>
                  <span className="badge badge-gray">{active.size}/{feats.length}</span>
                </div>
                <button type="button" onClick={() => toggleAllFeats(modId)}
                  className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline">
                  {allFeatsOn(modId) ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {feats.map(feat => {
                  const on = active.has(feat)
                  return (
                    <label key={feat} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={on}
                        onChange={() => toggleFeature(modId, feat)}
                        className="w-4 h-4 rounded accent-[var(--color-primary)] flex-shrink-0" />
                      <span className={`text-[12px] leading-tight ${on ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {feat}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  /* ── Step 4: Configure Roles ── */
  const renderStepRoles = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-gray-900">Configure Roles</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          Select the staff role templates your club needs. The Owner role is always included.
        </p>
      </div>
      <div className="space-y-3 pt-2">
        {DEFAULT_ROLES.map(r => {
          const active  = roles.includes(r.id)
          const locked  = r.id === 'owner'
          return (
            <button
              key={r.id}
              type="button"
              disabled={locked}
              onClick={() => toggleRole(r.id)}
              className={[
                'w-full text-left p-4 rounded-xl border-2 transition-all duration-150',
                active ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-200 bg-white hover:border-gray-300',
                locked ? 'opacity-90 cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[13px] font-semibold ${active ? 'text-[var(--color-primary)]' : 'text-gray-900'}`}>
                      {r.label}
                    </span>
                    {locked && <span className="badge badge-purple text-[10px]">Required</span>}
                  </div>
                  <p className="text-[12px] text-gray-500 mt-0.5">{r.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.perms.map(p => (
                      <span key={p} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                </div>
                <div className={[
                  'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all',
                  active ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300',
                ].join(' ')}>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  /* ── Step 5: Invite Staff ── */
  const renderStepInvite = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-gray-900">Invite Staff</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          Send email invites to your team. You can skip this and invite later from Settings.
        </p>
      </div>
      <div className="space-y-3 pt-2">
        {invites.map((inv, i) => (
          <div key={i} className="card px-4 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="staff@skylinesports.com"
                  value={inv.email} onChange={e => setInvite(i, 'email', e.target.value)} />
              </div>
              <div className="w-44 flex-shrink-0">
                <label className="form-label">Role</label>
                <select className="form-input" value={inv.role} onChange={e => setInvite(i, 'role', e.target.value)}>
                  {roles.map(rId => {
                    const r = DEFAULT_ROLES.find(x => x.id === rId)
                    return r ? <option key={rId} value={rId}>{r.label}</option> : null
                  })}
                </select>
              </div>
              {invites.length > 1 && (
                <button type="button" onClick={() => removeInvite(i)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors mb-0.5">
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={addInvite}
          className="btn btn-secondary w-full justify-center text-[12px] gap-2 py-2.5">
          + Add Another Invite
        </button>
      </div>
      <p className="text-[12px] text-gray-400">
        Staff will receive an activation email and can set their own password.
      </p>
    </div>
  )

  /* ── Step 6: Review & Launch ── */
  const renderStepReview = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-gray-900">Review & Launch</h2>
        <p className="text-[13px] text-gray-500 mt-1">Everything looks good? Launch your club dashboard.</p>
      </div>

      {/* Club */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={15} className="text-gray-400" />
          <h3 className="text-[13px] font-semibold text-gray-900">Club Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div><span className="text-gray-400">Name</span><div className="font-medium text-gray-800 mt-0.5">{club.name || '—'}</div></div>
          <div><span className="text-gray-400">Sport</span><div className="font-medium text-gray-800 mt-0.5">{club.sport || '—'}</div></div>
          <div><span className="text-gray-400">Country</span><div className="font-medium text-gray-800 mt-0.5">{club.country}</div></div>
          <div><span className="text-gray-400">Phone</span><div className="font-medium text-gray-800 mt-0.5">{club.phone ? `${club.phoneCode || '+91'} ${club.phone}` : '—'}</div></div>
        </div>
      </div>

      {/* Modules */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid size={15} className="text-gray-400" />
          <h3 className="text-[13px] font-semibold text-gray-900">Active Modules ({modules.length})</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {modules.map(id => {
            const m = ALL_MODULES.find(x => x.id === id)
            return (
              <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[11px] font-semibold rounded-lg">
                {m?.icon} {m?.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Roles */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-gray-400" />
          <h3 className="text-[13px] font-semibold text-gray-900">Enabled Roles ({roles.length})</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map(id => {
            const r = DEFAULT_ROLES.find(x => x.id === id)
            return (
              <span key={id} className="badge badge-gray">{r?.label}</span>
            )
          })}
        </div>
      </div>

      {/* Invites */}
      {invites.some(i => i.email) && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Send size={15} className="text-gray-400" />
            <h3 className="text-[13px] font-semibold text-gray-900">Staff Invites</h3>
          </div>
          <div className="space-y-2">
            {invites.filter(i => i.email).map((inv, i) => {
              const r = DEFAULT_ROLES.find(x => x.id === inv.role)
              return (
                <div key={i} className="flex items-center justify-between text-[12px]">
                  <span className="text-gray-700">{inv.email}</span>
                  <span className="badge badge-purple">{r?.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Launch note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-emerald-700 leading-relaxed">
          Your club will be created with the selected modules and roles. Staff invites will be sent immediately.
          You can update any configuration from <strong>Settings</strong> at any time.
        </p>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (step) {
      case 1: return renderStepClub()
      case 2: return renderStepModules()
      case 3: return renderStepFeatures()
      case 4: return renderStepRoles()
      case 5: return renderStepInvite()
      case 6: return renderStepReview()
      default: return null
    }
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}>
            <Trophy size={17} color="#fff" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-gray-900">Skyline Sports Club</div>
            <div className="text-[11px] text-gray-400">Club Setup Wizard</div>
          </div>
          <div className="ml-auto text-[12px] text-gray-400 font-medium">
            Step {step} of {STEPS.length}
          </div>
        </div>

        {/* Progress */}
        {renderProgress()}

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-5 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-[13px] text-red-600">{error}</p>
          </div>
        )}

        {/* Card */}
        <div className="card p-6 lg:p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            type="button"
            onClick={back}
            className={`btn btn-secondary gap-2 ${step === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft size={15} /> Back
          </button>

          <div className="flex items-center gap-2">
            {step < STEPS.length && (
              <button type="button" onClick={() => navigate('/dashboard')}
                className="btn btn-ghost text-[12px] text-gray-500">
                Skip setup
              </button>
            )}
            <button type="button" onClick={next} className="btn btn-primary gap-2 px-6" disabled={loading}>
              {step === STEPS.length ? (
                loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Launching Club...
                  </>
                ) : (
                  <><CheckCircle size={15} /> Launch Club</>
                )
              ) : (
                <>Continue <ChevronRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
