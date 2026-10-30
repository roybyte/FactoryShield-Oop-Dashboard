import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  UserCheck,
  Zap,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { SecurityAlert, User, ProductionLine, AlertSeverity, AlertStatus } from '../types/dashboard';

interface IncidentManagementViewProps {
  alerts: SecurityAlert[];
  users: User[];
  lines: ProductionLine[];
  currentUser: User;
  onOpenDetails: (alert: SecurityAlert) => void;
  onUpdateStatus: (alertId: string, newStatus: AlertStatus, note?: string) => void;
  onReassignOwner: (alertId: string, newOwnerId: string) => void;
}

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({
  alerts,
  users,
  lines,
  currentUser,
  onOpenDetails,
  onUpdateStatus,
  onReassignOwner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Filter alerts
  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.lineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = selectedSeverity === 'all' || a.severity === selectedSeverity;
    const matchesLine = selectedLine === 'all' || a.lineId === selectedLine;
    const matchesOwner = selectedOwner === 'all' || a.ownerId === selectedOwner;

    return matchesSearch && matchesSeverity && matchesLine && matchesOwner;
  });

  // Buckets for Kanban Board
  const openAlerts = filteredAlerts.filter((a) => a.status === 'Open');
  const investigatingAlerts = filteredAlerts.filter((a) => a.status === 'Investigating' || a.status === 'Escalated');
  const resolvedAlerts = filteredAlerts.filter((a) => a.status === 'Resolved');

  const severityBadge = (sev: AlertSeverity) => {
    const cls = {
      Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      Low: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    }[sev];
    return <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${cls}`}>{sev}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#111c33] border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Incident Management & Personnel Assignment
            </h3>
            <p className="text-xs text-slate-400">
              Track operational OT incident lifecycle from detection to on-site machine verification and closure.
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                viewMode === 'board' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Workflow Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dense List
            </button>
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by machine, line, IP, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Severity filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Line filter */}
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Production Lines</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          {/* Assigned Owner filter */}
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Assigned Personnel</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: OPEN */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#0f172a] border border-rose-900/40 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-900/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="font-bold text-white text-sm">Open / Unacknowledged</h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                {openAlerts.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {openAlerts.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No open unacknowledged incidents.
                </div>
              ) : (
                openAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-lg bg-[#111c33] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        {severityBadge(alert.severity)}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h5
                        onClick={() => onOpenDetails(alert)}
                        className="text-xs font-bold text-white group-hover:text-cyan-300 cursor-pointer transition-colors leading-snug mb-1"
                      >
                        {alert.title}
                      </h5>
                      <div className="text-[11px] text-cyan-400 font-medium mb-2">
                        {alert.lineName} · {alert.machineName}
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        {alert.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      {/* Reassign selector */}
                      <select
                        aria-label="Assign to"
                        value={alert.ownerId}
                        onChange={(e) => onReassignOwner(alert.id, e.target.value)}
                        className="text-[11px] bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => onUpdateStatus(alert.id, 'Investigating', `${currentUser.name} acknowledged and is investigating.`)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: INVESTIGATING / ESCALATED */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#0f172a] border border-amber-900/40 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-900/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="font-bold text-white text-sm">Investigating & Escalated</h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {investigatingAlerts.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {investigatingAlerts.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No incidents currently under investigation.
                </div>
              ) : (
                investigatingAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-lg bg-[#111c33] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {severityBadge(alert.severity)}
                          {alert.status === 'Escalated' && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                              ESCALATED
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(alert.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h5
                        onClick={() => onOpenDetails(alert)}
                        className="text-xs font-bold text-white group-hover:text-cyan-300 cursor-pointer transition-colors leading-snug mb-1"
                      >
                        {alert.title}
                      </h5>
                      <div className="text-[11px] text-cyan-400 font-medium mb-2">
                        {alert.lineName} · {alert.machineName}
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        {alert.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-semibold text-slate-200 truncate max-w-[110px]">
                          {alert.ownerName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenDetails(alert)}
                          className="px-2 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        >
                          Playbook
                        </button>
                        <button
                          onClick={() => onUpdateStatus(alert.id, 'Resolved', `Resolved on-site by ${currentUser.name}.`)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: RESOLVED */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#0f172a] border border-emerald-900/40 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-900/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-white text-sm">Resolved</h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {resolvedAlerts.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {resolvedAlerts.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No resolved incidents in this filter.
                </div>
              ) : (
                resolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => onOpenDetails(alert)}
                    className="p-3.5 rounded-lg bg-[#111c33]/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer opacity-85 hover:opacity-100"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                        RESOLVED
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(alert.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-200 mb-1 leading-snug">
                      {alert.title}
                    </h5>
                    <div className="text-[11px] text-slate-400">
                      {alert.lineName} · Handled by {alert.ownerName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Dense Table View */
        <div className="rounded-xl bg-[#111c33] border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">ID / Severity</th>
                <th className="p-3">Title & Summary</th>
                <th className="p-3">Line & Machine</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Owner</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 whitespace-nowrap font-mono">
                    <div className="font-bold text-white">{alert.id}</div>
                    <div className="mt-0.5">{severityBadge(alert.severity)}</div>
                  </td>
                  <td className="p-3">
                    <div
                      onClick={() => onOpenDetails(alert)}
                      className="font-bold text-white hover:text-cyan-300 cursor-pointer"
                    >
                      {alert.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {alert.description}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="text-cyan-300 font-medium">{alert.lineName}</div>
                    <div className="text-[11px] text-slate-400">{alert.machineName}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap font-mono">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        alert.status === 'Resolved'
                          ? 'text-emerald-300 bg-emerald-950/40 border-emerald-800'
                          : alert.status === 'Escalated'
                          ? 'text-purple-300 bg-purple-950/40 border-purple-800 animate-pulse font-bold'
                          : alert.status === 'Investigating'
                          ? 'text-amber-300 bg-amber-950/40 border-amber-800'
                          : 'text-rose-300 bg-rose-950/40 border-rose-800'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <select
                      aria-label="Reassign owner"
                      value={alert.ownerId}
                      onChange={(e) => onReassignOwner(alert.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => onOpenDetails(alert)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
