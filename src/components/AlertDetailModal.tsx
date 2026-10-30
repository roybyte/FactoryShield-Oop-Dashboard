import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Clock,
  UserCheck,
  Cpu,
  CheckCircle2,
  Zap,
  Lock,
  MessageSquare,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { SecurityAlert, User } from '../types/dashboard';

interface AlertDetailModalProps {
  alert: SecurityAlert;
  currentUser: User;
  users: User[];
  onClose: () => void;
  onUpdateStatus: (alertId: string, newStatus: 'Open' | 'Investigating' | 'Resolved' | 'Escalated', note?: string) => void;
  onReassignOwner: (alertId: string, newOwnerId: string, note?: string) => void;
  onAddComment: (alertId: string, comment: string) => void;
  onIsolatePort: (alertId: string, switchId: string, port: number) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  currentUser,
  users,
  onClose,
  onUpdateStatus,
  onReassignOwner,
  onAddComment,
  onIsolatePort,
}) => {
  const [activeTab, setActiveTab] = useState<'playbook' | 'technical' | 'timeline'>('playbook');
  const [commentText, setCommentText] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState(alert.ownerId);
  const [isPortIsolated, setIsPortIsolated] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(alert.id, commentText);
    setCommentText('');
  };

  const handleOwnerChange = (newId: string) => {
    setSelectedOwnerId(newId);
    onReassignOwner(alert.id, newId, `Reassigned to ${users.find((u) => u.id === newId)?.name}`);
  };

  const handleIsolateClick = () => {
    setIsPortIsolated(true);
    onIsolatePort(alert.id, alert.technicalDetails.switchId, alert.technicalDetails.switchPort);
  };

  const severityBadge = {
    Critical: 'text-rose-400 bg-rose-500/15 border-rose-500/40',
    High: 'text-orange-400 bg-orange-500/15 border-orange-500/40',
    Medium: 'text-amber-400 bg-amber-500/15 border-amber-500/40',
    Low: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/40',
  }[alert.severity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#131f37] border-b border-slate-700 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${severityBadge}`}>
                {alert.severity.toUpperCase()} PRIORITY
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-300">
                {alert.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Detected: {new Date(alert.detectedAt).toLocaleString()}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {alert.title}
            </h3>
            <div className="text-xs text-slate-300 flex items-center gap-2 font-medium">
              <span className="text-cyan-400">{alert.lineName}</span>
              <span className="text-slate-500">/</span>
              <span>{alert.machineName}</span>
              <span className="text-slate-500">/</span>
              <span className="font-mono text-slate-400">
                Port {alert.technicalDetails.switchId}:P{alert.technicalDetails.switchPort}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-[#0f172a] text-xs font-medium">
          <button
            onClick={() => setActiveTab('playbook')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'playbook'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Operations Playbook & Impact
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'technical'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Technical Network Telemetry
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Audit Trail ({alert.activityLog.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'playbook' && (
            <div className="space-y-4">
              {/* Plain-Language Operational Description */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
                  What Happened on the Shop Floor
                </div>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {alert.description}
                </p>
              </div>

              {/* Potential Production Impact */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5">
                <div className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Production Downtime Hazard
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {alert.potentialImpact}
                </p>
                <div className="text-xs font-mono font-semibold text-amber-300 pt-1">
                  Estimated Risk: {alert.estimatedDowntime}
                </div>
              </div>

              {/* Recommended Steps with interactive checkboxes */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
                  Step-by-Step Operator Action Checklist
                </div>
                <div className="space-y-2">
                  {alert.recommendedActions.map((step, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checkedSteps[idx]
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200 line-through'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedSteps[idx]}
                        onChange={() => toggleStep(idx)}
                        className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm leading-normal">
                        <strong>Step {idx + 1}:</strong> {step}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Switch Port Isolation Action */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Physical Switch Port Lockdown ({alert.technicalDetails.switchId}:P{alert.technicalDetails.switchPort})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Instantly quarantine offending network port to prevent PLC setpoint tampering.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleIsolateClick}
                  disabled={isPortIsolated}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    isPortIsolated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                  }`}
                >
                  {isPortIsolated ? 'Port Isolated' : 'Isolate Switch Port'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 font-mono text-[11px] block">Source IP & Host</span>
                  <span className="text-cyan-300 font-mono font-bold text-sm">
                    {alert.technicalDetails.sourceIp}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 font-mono text-[11px] block">Source Hardware MAC</span>
                  <span className="text-slate-200 font-mono font-bold text-sm">
                    {alert.technicalDetails.sourceMac}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 font-mono text-[11px] block">Target Industrial Asset</span>
                  <span className="text-white font-mono text-sm">
                    {alert.technicalDetails.targetIp || alert.machineName}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 font-mono text-[11px] block">Protocol & Industrial Port</span>
                  <span className="text-white font-mono text-sm">
                    {alert.technicalDetails.protocol}
                  </span>
                </div>
              </div>

              {/* Raw Frame Payload Sample */}
              <div className="p-3.5 rounded-lg bg-black/60 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>PACKET LOG INSPECTOR</span>
                  <span className="text-cyan-400">{alert.technicalDetails.trafficRate || '14.2 KB/s'}</span>
                </div>
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-950 rounded">
                  {alert.technicalDetails.rawPayloadSample || 'No raw payload captured'}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {alert.activityLog.map((log) => (
                  <div key={log.id} className="relative group">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#0f172a]" />
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="font-semibold text-slate-200">
                          {log.userName} ({log.userRole})
                        </span>
                        <span className="font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{log.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add operational investigation note..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                >
                  Post Note
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 bg-[#131f37] border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Owner Reassign control */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedOwnerId}
              onChange={(e) => handleOwnerChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 w-full sm:w-48 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Workflow Status buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            {alert.status === 'Open' && (
              <button
                onClick={() => onUpdateStatus(alert.id, 'Investigating', `${currentUser.name} began on-site investigation.`)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
              >
                Acknowledge & Investigate
              </button>
            )}

            {alert.status !== 'Escalated' && alert.status !== 'Resolved' && (
              <button
                onClick={() => onUpdateStatus(alert.id, 'Escalated', `Escalated by ${currentUser.name} to SecurePlant Cyber SOC & Plant Management.`)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-purple-700 hover:bg-purple-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" /> Escalate to SOC
              </button>
            )}

            {alert.status !== 'Resolved' && (
              <button
                onClick={() => onUpdateStatus(alert.id, 'Resolved', `Resolved by ${currentUser.name}: Verified safe, disconnected rogue hardware, verified machine integrity.`)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
