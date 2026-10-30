import React from 'react';
import { ShieldAlert, Cpu, AlertTriangle, Activity, FileText, Server, UserCheck, Play, Pause } from 'lucide-react';
import { User } from '../types/dashboard';

interface HeaderProps {
  activeTab: 'dashboard' | 'alerts' | 'incidents' | 'lines' | 'network' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'alerts' | 'incidents' | 'lines' | 'network' | 'reports') => void;
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  openCount: number;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onSelectUser,
  isSimulating,
  onToggleSimulation,
  openCount,
  criticalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-900/20 text-white font-black tracking-wider text-sm">
            FS
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              FactoryShield <span className="text-cyan-400 font-semibold">Ops</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase hidden sm:inline">
              Shop-Floor OT Cyber Monitor
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 relative ${
              activeTab === 'alerts'
                ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            Alerts
            {openCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[11px] font-mono font-bold rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {openCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'incidents'
                ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Incidents
            {criticalCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[11px] font-mono font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {criticalCount} Crit
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('lines')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'lines'
                ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            Production Lines
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'network'
                ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4 text-indigo-400" />
            Network & Devices
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            Historical Reports
          </button>
        </nav>

        {/* Zone 3: Role Switcher & Simulator State */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Simulation status pill */}
          <button
            onClick={onToggleSimulation}
            title={isSimulating ? "Click to pause telemetry simulation" : "Click to resume telemetry simulation"}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors ${
              isSimulating
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-mono">
              {isSimulating ? 'SIM: RUNNING' : 'SIM: PAUSED'}
            </span>
          </button>

          {/* Active User / Role Selector */}
          <div className="relative flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
            <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 leading-none">Acting as:</span>
              <select
                aria-label="Current User Role"
                value={currentUser.id}
                onChange={(e) => {
                  const found = users.find((u) => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className="bg-transparent text-slate-200 font-medium text-xs focus:outline-none cursor-pointer pr-1"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
