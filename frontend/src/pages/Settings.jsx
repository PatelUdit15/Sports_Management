import { Settings as SettingsIcon, Bell, Shield, Database, Palette } from 'lucide-react'

const sections = [
  { icon: SettingsIcon, title: 'General Settings',  desc: 'Club name, timezone, currency, and basic configurations.' },
  { icon: Bell,         title: 'Notifications',     desc: 'Email and SMS alert preferences for bookings and payments.' },
  { icon: Shield,       title: 'Security & Access', desc: 'Manage admin roles, permissions, and 2FA settings.' },
  { icon: Database,     title: 'Data & Backups',    desc: 'Configure automated backups and data retention policies.' },
  { icon: Palette,      title: 'Appearance',         desc: 'Customize branding colors, logo, and UI themes.' },
]

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Settings</h1>
        <p className="text-[13px] text-gray-500 mt-1.5">Configure club operations, access control, and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'var(--color-primary-light)' }}
            >
              <Icon size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-gray-900 mb-1">{title}</div>
              <div className="text-[12px] text-gray-500 leading-relaxed">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-[15px] font-bold text-gray-900 mb-5">Club Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className="form-label">Club Name</label><input className="form-input" defaultValue="Skyline Sports Club" /></div>
          <div>
            <label className="form-label">Timezone</label>
            <select className="form-input"><option>Asia/Kolkata (IST)</option><option>UTC</option></select>
          </div>
          <div><label className="form-label">Currency</label><input className="form-input" defaultValue="INR (₹)" /></div>
          <div><label className="form-label">Admin Email</label><input className="form-input" type="email" defaultValue="admin@skylinesports.com" /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn btn-primary px-5 py-2.5">Save Changes</button>
          <button className="btn btn-secondary px-5 py-2.5">Reset</button>
        </div>
      </div>
    </div>
  )
}
