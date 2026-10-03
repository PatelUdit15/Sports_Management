import { BarChart2, Download } from 'lucide-react'

const reports = [
  { name:'Monthly Revenue Report',    period:'October 2026',   generated:'24 Oct 2026', size:'2.4 MB' },
  { name:'Member Attendance Summary', period:'October 2026',   generated:'24 Oct 2026', size:'1.1 MB' },
  { name:'Court Utilisation Report',  period:'Q3 2026',        generated:'01 Oct 2026', size:'3.2 MB' },
  { name:'Staff Payroll Sheet',        period:'September 2026', generated:'30 Sep 2026', size:'0.8 MB' },
  { name:'Pro Shop Sales Analysis',   period:'September 2026', generated:'30 Sep 2026', size:'1.7 MB' },
]

export default function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Reports & Analytics</h1>
          <p className="text-[13px] text-gray-500 mt-1.5">Download and review operational reports and performance analytics.</p>
        </div>
        <button className="btn btn-primary gap-2 flex-shrink-0 mt-0.5"><BarChart2 size={15} /> Generate Report</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[{label:'Reports Generated',value:'34',color:'#6b3fa0'},{label:'Scheduled Reports',value:'6',color:'#2563eb'},{label:'Last Generated',value:'Today',color:'#16a34a'}].map(s => (
          <div key={s.label} className="card p-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-[26px] font-bold" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <BarChart2 size={16} className="text-gray-400" />
          <h2 className="text-[15px] font-bold text-gray-900">Available Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Report Name</th><th>Period</th><th>Generated</th><th>File Size</th><th>Action</th></tr></thead>
            <tbody>
              {reports.map((r,i) => (
                <tr key={i}>
                  <td className="font-semibold text-gray-900">{r.name}</td>
                  <td className="text-gray-600">{r.period}</td>
                  <td className="text-[12px] text-gray-500 whitespace-nowrap">{r.generated}</td>
                  <td className="font-mono text-[12px] text-gray-600">{r.size}</td>
                  <td>
                    <button className="btn btn-secondary gap-1.5 text-[12px] px-3 py-1.5">
                      <Download size={13} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
