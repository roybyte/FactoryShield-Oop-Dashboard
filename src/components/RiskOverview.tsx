import React from 'react';
import { AlertOctagon, DollarSign, ShieldCheck, Clock, Server, ArrowUpRight, Zap } from 'lucide-react';
import { SecurityAlert, ProductionLine } from '../types/dashboard';

interface RiskOverviewProps {
  alerts: SecurityAlert[];
  lines: ProductionLine[];
  onQuickFilterCritical: () => void;
  onOpenSimulator: () => void;
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({
  alerts,
  lines,
  onQuickFilterCritical,
  onOpenSimulator,
}) => {
  const activeAlerts = alerts.filter((a) => a.status !== 'Resolved');
  const criticalCount = activeAlerts.filter((a) => a.severity === 'Critical').length;
  const highCount = activeAlerts.filter((a) => a.severity === 'High').length;
  const mediumCount = activeAlerts.filter((a) => a.severity === 'Medium').length;
  const lowCount = activeAlerts.filter((a) => a.severity === 'Low').length;

  // Calculate estimated hourly downtime exposure for affected lines
  const impactedLineIds = new Set(activeAlerts.map((a) => a.lineId));
  const hourlyExposure = lines
    .filter((l) => impactedLineIds.has(l.id))
    .reduce((sum, l) => sum + l.hourlyDowntimeCost, 0);

  // Overall Plant Security Status
  let securityStatus = 'NOMINAL';
  let statusBadgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let statusDescription = 'All shop-floor switches, PLCs, and robot cells are communicating within baseline tolerances.';

  if (criticalCount > 0) {
    securityStatus = 'CRITICAL THREAT';
    statusBadgeColor = 'text-rose-400 border-rose-500/40 bg-rose-500/15 animate-pulse';
    statusDescription = 'Active high-hazard anomaly detected on core automation controllers. Immediate supervisor verification required.';
  } else if (highCount > 0) {
    securityStatus = 'ELEVATED RISK';
    statusBadgeColor = 'text-orange-400 border-orange-500/40 bg-orange-500/15';
    statusDescription = 'Rogue hardware or unverified OT network connection detected. Inspection recommended within 15 minutes.';
  } else if (mediumCount > 0 || lowCount > 0) {
    securityStatus = 'GUARDED MONITORING';
    statusBadgeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    statusDescription = 'Minor protocol scans or gateway telemetry deviations logged. Standard shift check scheduled.';
  }

  return (
    <div className="space-y-4">
      {/* Simulation Prototype Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
            SIMULATION MODE
          </span>
          <span>
            Real-time simulated factory network telemetry. All PLC packets, switches, and alerts reflect active test parameters.
          </span>
        </div>
        <button
          onClick={onOpenSimulator}
          className="self-start sm:self-auto flex items-center gap-1 font-semibold text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap cursor-pointer underline underline-offset-2"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Test Cyber Threat Scenarios
        </button>
      </div>

      {/* Primary Plant Status & KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Factory Risk Level */}
        <div className="md:col-span-2 p-5 rounded-xl bg-[#111c33] border border-slate-800/90 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
                  Shop Floor Security Posture
                </span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${statusBadgeColor}`}>
                  {securityStatus}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {criticalCount > 0 ? 'Urgent Operational Cyber Incident' : 'Factory Network Telemetry'}
              </h2>
            </div>
            
            <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
              {criticalCount > 0 ? (
                <AlertOctagon className="w-7 h-7 text-rose-500" />
              ) : highCount > 0 ? (
                <AlertOctagon className="w-7 h-7 text-orange-400" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 mt-3 mb-4 leading-relaxed">
            {statusDescription}
          </p>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Affected Lines: <strong className="text-white font-mono">{impactedLineIds.size}</strong> of {lines.length}
            </span>
            {criticalCount > 0 && (
              <button
                onClick={onQuickFilterCritical}
                className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors"
              >
                View {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Production Downtime Risk */}
        <div className="p-5 rounded-xl bg-[#111c33] border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-mono">Downtime Loss Risk</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              ${hourlyExposure.toLocaleString()}
              <span className="text-xs text-slate-400 font-sans font-normal ml-1">/ hr</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Combined operational downtime cost across {impactedLineIds.size} impacted production line{impactedLineIds.size === 1 ? '' : 's'}.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Critical Line:</span>
            <span className="font-semibold text-white">Line 2 ($22k/hr)</span>
          </div>
        </div>

        {/* Card 3: Active Alert Count & Breakdown */}
        <div className="p-5 rounded-xl bg-[#111c33] border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-mono">Active Incidents</span>
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {activeAlerts.length}
              <span className="text-xs text-slate-400 font-sans font-normal ml-2">unresolved</span>
            </div>

            {/* Severity Pill / Bar breakdown */}
            <div className="grid grid-cols-4 gap-1.5 mt-3 text-center text-xs font-mono">
              <div className="p-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <div className="text-[10px] text-rose-400">CRIT</div>
                <div className="font-bold">{criticalCount}</div>
              </div>
              <div className="p-1 rounded bg-orange-500/10 border border-orange-500/30 text-orange-300">
                <div className="text-[10px] text-orange-400">HIGH</div>
                <div className="font-bold">{highCount}</div>
              </div>
              <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <div className="text-[10px] text-amber-400">MED</div>
                <div className="font-bold">{mediumCount}</div>
              </div>
              <div className="p-1 rounded bg-slate-700/40 border border-slate-700 text-slate-300">
                <div className="text-[10px] text-slate-400">LOW</div>
                <div className="font-bold">{lowCount}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Mean Ack Time:
            </span>
            <span className="font-mono text-cyan-300 font-bold">4.2 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};
