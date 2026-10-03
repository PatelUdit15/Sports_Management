import { useState } from 'react'
import { Building2, ToggleLeft, ToggleRight, Save, Shield, Bell, CreditCard, Link } from 'lucide-react'

const modules = [
  { id: 'members', name: 'Members Management', description: 'Manage club memberships, plans, and member profiles', enabled: true },
  { id: 'courts', name: 'Court Bookings', description: 'Schedule and manage court reservations', enabled: true },
  { id: 'shop', name: 'Shop & Inventory', description: 'Online and in-store product management', enabled: false },
  { id: 'cafe', name: 'Cafe / Bar', description: 'Menu, table, and kitchen order management', enabled: false },
  { id: 'staff', name: 'Staff & HR', description: 'Employee management, attendance, and payroll', enabled: true },
  { id: 'finance', name: 'Finance & Accounting', description: 'Revenue tracking, invoicing, and reports', enabled: true },
  { id: 'enquiries', name: 'Enquiries / CRM', description: 'Lead management and trial class scheduling', enabled: true },
  { id: 'clients', name: 'Business Clients', description: 'Corporate accounts and bulk invoicing', enabled: false },
]

const settingsTabs = [
  { id: 'profile', label: 'Club Profile', icon: Building2 },
  { id: 'modules', label: 'Modules', icon: ToggleLeft },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Link },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [moduleStates, setModuleStates] = useState(
    Object.fromEntries(modules.map(m => [m.id, m.enabled]))
  )

  const toggleModule = (id) => {
    setModuleStates(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Tabs */}
        <div className="card p-3">
          <nav className="space-y-0.5">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)] mb-5">Club Profile</h2>
              <form className="space-y-4">
                {/* Logo Upload */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center border-2 border-dashed border-[var(--color-border)]">
                    <Building2 size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <button type="button" className="btn-secondary text-[12px] py-1.5 px-3">Upload Logo</button>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Club Name</label>
                    <input className="form-input" defaultValue="Skyline Sports Club" />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" defaultValue="admin@skylinesports.com" />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" defaultValue="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="form-label">Website URL</label>
                    <input className="form-input" defaultValue="https://skylinesports.com" />
                  </div>
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <textarea className="form-input" rows={2} defaultValue="123, Sports Complex Road, Sector 45" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">City</label>
                    <input className="form-input" defaultValue="Ahmedabad" />
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <input className="form-input" defaultValue="Gujarat" />
                  </div>
                  <div>
                    <label className="form-label">Country</label>
                    <select className="form-input">
                      <option>India</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Timezone</label>
                    <select className="form-input">
                      <option>Asia/Kolkata (UTC+5:30)</option>
                      <option>America/New_York (UTC-5)</option>
                      <option>Europe/London (UTC+0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Currency</label>
                    <select className="form-input">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button type="submit" className="btn-primary">
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="card p-6">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)] mb-1">Enabled Modules</h2>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-5">
                Toggle modules on or off based on your club's needs. Disabled modules won't appear in the sidebar.
              </p>
              <div className="space-y-3">
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      moduleStates[mod.id]
                        ? 'border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30'
                        : 'border-[var(--color-border)]'
                    }`}
                  >
                    <div>
                      <div className="text-[13px] font-medium text-[var(--color-text)]">{mod.name}</div>
                      <div className="text-[12px] text-[var(--color-text-secondary)]">{mod.description}</div>
                    </div>
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="flex-shrink-0 ml-4"
                    >
                      {moduleStates[mod.id] ? (
                        <ToggleRight size={28} className="text-[var(--color-primary)]" />
                      ) : (
                        <ToggleLeft size={28} className="text-[var(--color-text-muted)]" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-end">
                <button className="btn-primary">
                  <Save size={14} /> Save Configuration
                </button>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="card p-6">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)] mb-4">Roles & Permissions</h2>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Configure user roles and granular permissions. Coming soon.
              </p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="card p-6">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)] mb-4">Billing</h2>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Manage your subscription plan and payment methods. Coming soon.
              </p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)] mb-4">Notifications</h2>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Configure email and push notification preferences. Coming soon.
              </p>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="card p-6">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)] mb-4">Integrations</h2>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Connect payment gateways, SMS providers, and more. Coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
