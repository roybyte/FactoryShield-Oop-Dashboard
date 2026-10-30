import React from 'react';
import { Cpu, AlertTriangle, ShieldCheck, ChevronRight, Activity, DollarSign } from 'lucide-react';
import { ProductionLine, SecurityAlert, User } from '../types/dashboard';

interface LineStatusGridProps {
  lines: ProductionLine[];
  alerts: SecurityAlert[];
  users: User[];
  onSelectLine: (lineId: string) => void;
  onSelectAlert: (alert: SecurityAlert) => void;
}

export const LineStatusGrid: React.FC<LineStatusGridProps> = ({
  lines,
  alerts,
  users,
  onSelectLine,
  onSelectAlert,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Shop-Floor Production Line Security Status
          </h3>
          <p className="text-xs text-slate-400">
            Real-time physical asset mapping connecting switches, PLCs, and robotic cells to supervisor responsibilities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lines.map((line) => {
          const supervisor = users.find((u) => u.id === line.supervisorId);
          const lineAlerts = alerts.filter((a) => a.lineId === line.id && a.status !== 'Resolved');
          const hasCritical = lineAlerts.some((a) => a.severity === 'Critical');
          const hasHigh = lineAlerts.some((a) => a.severity === 'High');

          let statusBadge = (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> NORMAL
            </span>
          );

          if (hasCritical) {
            statusBadge = (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border text-rose-400 bg-rose-500/10 border-rose-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-500" /> CRITICAL RISK
              </span>
            );
          } else if (hasHigh || lineAlerts.length > 0) {
            statusBadge = (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border text-orange-400 bg-orange-500/10 border-orange-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" /> AT RISK
              </span>
            );
          }

          return (
            <div
              key={line.id}
              className={`p-4 sm:p-5 rounded-xl bg-[#111c33] border transition-all ${
                hasCritical
                  ? 'border-rose-900/60 shadow-lg shadow-rose-950/20'
                  : hasHigh
                  ? 'border-orange-900/50 shadow-md shadow-orange-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400">{line.code}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">Supervisor: {supervisor?.name || 'Unassigned'}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {line.name}
                  </h4>
                </div>
                {statusBadge}
              </div>

              <p className="text-xs text-slate-300 mt-2 mb-3 line-clamp-2 leading-relaxed">
                {line.description}
              </p>

              {/* Machine inventory strip */}
              <div className="space-y-1.5 py-2.5 border-y border-slate-800/80">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Monitored OT Machines & PLCs</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <DollarSign className="w-3 h-3 text-amber-400" />
                    ${line.hourlyDowntimeCost.toLocaleString()}/hr
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                  {line.machines.map((machine) => {
                    const isMachineTargeted = lineAlerts.some((a) => a.machineId === machine.id);
                    return (
                      <div
                        key={machine.id}
                        className={`px-2 py-1.5 rounded border text-[11px] flex flex-col justify-between ${
                          isMachineTargeted
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="font-medium truncate" title={machine.name}>
                          {machine.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
                          <span>{machine.type}</span>
                          <span className={isMachineTargeted ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {machine.switchId}:P{machine.switchPort}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active alerts on this line */}
              <div className="mt-3 flex items-center justify-between">
                {lineAlerts.length > 0 ? (
                  <div className="text-xs text-rose-300 flex items-center gap-1.5 font-medium">
                    <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>
                      {lineAlerts.length} active cyber alert{lineAlerts.length > 1 ? 's' : ''} on this line
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>No active security threats</span>
                  </div>
                )}

                <button
                  onClick={() => onSelectLine(line.id)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  View Line <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
