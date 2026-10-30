import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  DollarSign,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  TrendingDown,
} from 'lucide-react';
import { HistoricalIncident } from '../types/dashboard';

interface HistoricalReportsViewProps {
  incidents: HistoricalIncident[];
}

export const HistoricalReportsView: React.FC<HistoricalReportsViewProps> = ({ incidents }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.incidentCode.toLowerCase().includes(search.toLowerCase()) ||
      inc.lineName.toLowerCase().includes(search.toLowerCase()) ||
      inc.rootCause.toLowerCase().includes(search.toLowerCase());
    const matchesSev = severityFilter === 'all' || inc.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const totalLossPrevented = incidents.reduce((sum, i) => sum + i.estimatedLossPrevented, 0);
  const avgDuration = Math.round(incidents.reduce((sum, i) => sum + i.durationMinutes, 0) / (incidents.length || 1));

  const handleExportCSV = () => {
    const headers = ['Incident Code', 'Date', 'Title', 'Severity', 'Line', 'Machine', 'Duration (Min)', 'Loss Prevented ($)', 'Resolved By', 'Root Cause'];
    const rows = filtered.map((i) => [
      i.incidentCode,
      i.date,
      `"${i.title.replace(/"/g, '""')}"`,
      i.severity,
      `"${i.lineName}"`,
      `"${i.machineName}"`,
      i.durationMinutes,
      i.estimatedLossPrevented,
      `"${i.resolvedBy}"`,
      `"${i.rootCause.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `factoryshield-incident-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* KPI Header Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111c33] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Downtime Loss Prevented
            </span>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              ${totalLossPrevented.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingDown className="w-3.5 h-3.5" /> 100% prevented catastrophic line halts
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111c33] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Historical Incidents Mitigated
            </span>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {incidents.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Across all 4 active production lines
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111c33] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Average Containment Time
            </span>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {avgDuration} <span className="text-sm font-sans font-normal text-slate-400">min</span>
            </div>
            <span className="text-[11px] text-cyan-400 mt-1 block">
              From detection to physical port disconnect
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Historical Table & Search */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#111c33] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Historical Incident Reports & Root Cause Archive
            </h3>
            <p className="text-xs text-slate-400">
              Documented records of resolved industrial cybersecurity events, verified root causes, and containment measures.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export CSV Audit Log
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search past incidents, machine, root cause..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Incidents List Cards */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const sevBadge = {
              Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
              High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
              Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
              Low: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
            }[item.severity];

            return (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                      {item.incidentCode}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${sevBadge}`}>
                      {item.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.date} · {item.durationMinutes} min to resolve
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>${item.estimatedLossPrevented.toLocaleString()} saved</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                  <div className="text-xs text-cyan-300 font-medium">
                    {item.lineName} · {item.machineName}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded bg-[#111c33]/70 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">
                      Investigated Root Cause
                    </span>
                    <p className="text-slate-300 leading-relaxed">{item.rootCause}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">
                      Corrective Action & Resolution
                    </span>
                    <p className="text-slate-300 leading-relaxed">{item.actionSummary}</p>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      Resolved by: <span className="text-slate-200">{item.resolvedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
