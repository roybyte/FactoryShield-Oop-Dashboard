import React from 'react';
import { Activity, ShieldAlert, AlertTriangle, Cpu, Server, FileText } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'dashboard' | 'alerts' | 'incidents' | 'lines' | 'network' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'alerts' | 'incidents' | 'lines' | 'network' | 'reports') => void;
  openCount: number;
  criticalCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  openCount,
  criticalCount,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg min-h-[44px] min-w-[50px] transition-colors ${
          activeTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Activity className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Overview</span>
      </button>

      <button
        onClick={() => setActiveTab('alerts')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg min-h-[44px] min-w-[50px] transition-colors relative ${
          activeTab === 'alerts' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <ShieldAlert className="w-5 h-5 mb-0.5 text-orange-400" />
          {openCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
              {openCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Alerts</span>
      </button>

      <button
        onClick={() => setActiveTab('incidents')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg min-h-[44px] min-w-[50px] transition-colors relative ${
          activeTab === 'incidents' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <AlertTriangle className="w-5 h-5 mb-0.5 text-amber-400" />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
              {criticalCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Incidents</span>
      </button>

      <button
        onClick={() => setActiveTab('lines')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg min-h-[44px] min-w-[50px] transition-colors ${
          activeTab === 'lines' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Cpu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Lines</span>
      </button>

      <button
        onClick={() => setActiveTab('network')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg min-h-[44px] min-w-[50px] transition-colors ${
          activeTab === 'network' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Server className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Network</span>
      </button>

      <button
        onClick={() => setActiveTab('reports')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg min-h-[44px] min-w-[50px] transition-colors ${
          activeTab === 'reports' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Reports</span>
      </button>
    </nav>
  );
};
