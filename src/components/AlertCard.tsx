import React from 'react';
import { AlertCircle, Clock, UserCheck, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { SecurityAlert, User } from '../types/dashboard';

interface AlertCardProps {
  alert: SecurityAlert;
  currentUser: User;
  onOpenDetails: (alert: SecurityAlert) => void;
  onAcknowledge: (alertId: string) => void;
  onEscalate: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  currentUser,
  onOpenDetails,
  onAcknowledge,
  onEscalate,
  onResolve,
}) => {
  // Severity styling
  const severityStyles = {
    Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/20',
    High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Low: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  }[alert.severity];

  const statusStyles = {
    Open: 'text-rose-300 bg-rose-950/40 border-rose-800/60',
    Investigating: 'text-amber-300 bg-amber-950/40 border-amber-800/60',
    Escalated: 'text-purple-300 bg-purple-950/40 border-purple-800/60 font-bold animate-pulse',
    Resolved: 'text-emerald-300 bg-emerald-950/40 border-emerald-800/60',
  }[alert.status];

  const isAssignedToCurrent = alert.ownerId === currentUser.id;

  return (
    <div
      onClick={() => onOpenDetails(alert)}
      className="p-4 sm:p-5 rounded-xl bg-[#111c33] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group"
    >
      <div>
        {/* Top metadata strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${severityStyles}`}>
              {alert.severity.toUpperCase()}
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${statusStyles}`}>
              {alert.status.toUpperCase()}
            </span>
            {alert.isSimulated && (
              <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                SIM
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
          {alert.title}
        </h4>

        {/* Line & Machine mapping */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300 mt-1 mb-2.5">
          <span className="font-semibold text-cyan-400">{alert.lineName}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">{alert.machineName}</span>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-slate-400 text-[11px]">
            {alert.technicalDetails.switchId}:P{alert.technicalDetails.switchPort}
          </span>
        </div>

        {/* Plain-language Operational Impact */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs mb-3 space-y-1">
          <div className="text-slate-300 line-clamp-2 leading-relaxed">
            {alert.description}
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-amber-300 font-medium">
            <span className="flex items-center gap-1 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {alert.estimatedDowntime}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Owner & Touch Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">Assigned Owner:</span>
            <span className="font-semibold text-slate-200">
              {alert.ownerName} {isAssignedToCurrent && <span className="text-cyan-400 font-normal">(You)</span>}
            </span>
          </div>
        </div>

        {/* Action button cluster (click propagation stopped to prevent card double-trigger) */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {alert.status === 'Open' && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
          )}

          {alert.status === 'Investigating' && (
            <button
              onClick={() => onResolve(alert.id)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
            </button>
          )}

          {alert.status !== 'Resolved' && alert.status !== 'Escalated' && (
            <button
              onClick={() => onEscalate(alert.id)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-rose-900/30 text-rose-300 border border-slate-700 hover:border-rose-800/50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" /> Escalate
            </button>
          )}

          <button
            onClick={() => onOpenDetails(alert)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="View Details & OT Playbook"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
