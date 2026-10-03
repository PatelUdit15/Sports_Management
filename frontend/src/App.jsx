import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <main className="relative z-10 max-w-2xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-8">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 rounded-full">
            React
          </span>
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/70 border border-purple-800/60 rounded-full">
            Vite
          </span>
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/70 border border-teal-800/60 rounded-full">
            Tailwind CSS v4
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Skyline Student Association
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Your React + Vite application is successfully configured with Tailwind CSS in the <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm">frontend</code> folder.
          </p>
        </div>

        {/* Interactive Demo Counter */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setCount((prev) => prev + 1)}
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 active:scale-95 transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <span>Interactive Counter</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-black/30 font-mono font-bold text-sm">
              {count}
            </span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-1">⚡ Ultra Fast</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Instant HMR and optimized lightning-fast builds powered by Vite.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-1">🎨 Modern Styles</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Tailwind CSS v4 engine configured with Vite plugin.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-1">📁 Modular Structure</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Isolated inside <span className="text-slate-300 font-mono">/frontend</span> ready for backend integrations.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-xs text-slate-500 border-t border-slate-800/80">
          Edit <code className="text-slate-400 font-mono">frontend/src/App.jsx</code> to begin building your app.
        </div>
      </main>
    </div>
  )
}

export default App
