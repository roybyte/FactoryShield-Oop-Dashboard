import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Cpu,
  Server,
  FileText,
  Activity,
  Zap,
  Filter,
  CheckCircle2,
  RefreshCw,
  Bell,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';
import {
  INITIAL_ALERTS,
  INITIAL_USERS,
  PRODUCTION_LINES,
  INITIAL_DEVICES,
  HISTORICAL_INCIDENTS,
  SIMULATION_SCENARIOS,
} from './data/factoryData';
import {
  SecurityAlert,
  ProductionLine,
  User,
  NetworkDevice,
  HistoricalIncident,
  AlertStatus,
  AlertSeverity,
} from './types/dashboard';
import { IncidentMappingEngine, RawNetworkEventInput } from './services/incidentMapper';
import { Header } from './components/Header';
import { RiskOverview } from './components/RiskOverview';
import { LineStatusGrid } from './components/LineStatusGrid';
import { AlertCard } from './components/AlertCard';
import { AlertDetailModal } from './components/AlertDetailModal';
import { IncidentManagementView } from './components/IncidentManagementView';
import { NetworkMonitorView } from './components/NetworkMonitorView';
import { HistoricalReportsView } from './components/HistoricalReportsView';
import { SimulationControls } from './components/SimulationControls';
import { MobileNav } from './components/MobileNav';

export default function App() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [lines, setLines] = useState<ProductionLine[]>(PRODUCTION_LINES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [devices, setDevices] = useState<NetworkDevice[]>(INITIAL_DEVICES);
  const [historicalIncidents, setHistoricalIncidents] = useState<HistoricalIncident[]>(HISTORICAL_INCIDENTS);

  // Active user: Defaults to Bob Kowalski (Shift Supervisor, Line 2)
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'incidents' | 'lines' | 'network' | 'reports'>('dashboard');

  // Modal & Detail states
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);

  // Notification toast for new incidents
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state for Alerts tab
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all');
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>('all');
  const [alertLineFilter, setAlertLineFilter] = useState<string>('all');
  const [onlyMyAlerts, setOnlyMyAlerts] = useState<boolean>(false);

  // Recalculate line risk statuses whenever alerts change
  useEffect(() => {
    setLines((prevLines) =>
      prevLines.map((line) => {
        const lineAlerts = alerts.filter((a) => a.lineId === line.id && a.status !== 'Resolved');
        const hasCritical = lineAlerts.some((a) => a.severity === 'Critical');
        const hasHigh = lineAlerts.some((a) => a.severity === 'High');

        let status: 'Normal' | 'Warning' | 'Critical Risk' = 'Normal';
        if (hasCritical) status = 'Critical Risk';
        else if (hasHigh || lineAlerts.length > 0) status = 'Warning';

        return {
          ...line,
          activeIncidentCount: lineAlerts.length,
          status,
        };
      })
    );
  }, [alerts]);

  // Periodic subtle background simulation (every 40 seconds emits simulated benign or minor event if running)
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      // Small simulated background ping to keep the feed alive
      console.log('Background factory telemetry heartbeat synchronized.');
    }, 40000);

    return () => clearInterval(timer);
  }, [isSimulating]);

  // Handlers for Alert Lifecycle
  const handleAcknowledgeAlert = (alertId: string) => {
    handleUpdateStatus(alertId, 'Investigating', `${currentUser.name} (${currentUser.role}) acknowledged this alert.`);
  };

  const handleEscalateAlert = (alertId: string) => {
    // Find IT / SOC user or Plant Manager
    const socUser = users.find((u) => u.role === 'IT / Security') || users.find((u) => u.role === 'Plant Manager') || users[0];

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        const now = new Date().toISOString();
        return {
          ...a,
          status: 'Escalated',
          ownerId: socUser.id,
          ownerName: socUser.name,
          ownerRole: socUser.role,
          updatedAt: now,
          activityLog: [
            ...a.activityLog,
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              userId: currentUser.id,
              userName: currentUser.name,
              userRole: currentUser.role,
              action: 'Escalated',
              comment: `Escalated by ${currentUser.name} to ${socUser.name} (${socUser.role}) for priority containment.`,
            },
          ],
        };
      })
    );

    setToastMessage(`Incident escalated to ${socUser.name}`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleResolveAlert = (alertId: string, customNote?: string) => {
    handleUpdateStatus(
      alertId,
      'Resolved',
      customNote || `Resolved by ${currentUser.name}: Verified physical safety, confirmed equipment integrity.`
    );
  };

  const handleUpdateStatus = (alertId: string, newStatus: AlertStatus, note?: string) => {
    const now = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        const updatedLog = [
          ...a.activityLog,
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            action: (newStatus === 'Resolved' ? 'Resolved' : newStatus === 'Escalated' ? 'Escalated' : 'StatusChanged') as any,
            comment: note || `Status changed to ${newStatus} by ${currentUser.name}.`,
          },
        ];

        return {
          ...a,
          status: newStatus,
          updatedAt: now,
          resolvedAt: newStatus === 'Resolved' ? now : a.resolvedAt,
          activityLog: updatedLog,
        };
      })
    );

    // If modal is open with this alert, keep it in sync
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert((prev) => (prev ? { ...prev, status: newStatus, updatedAt: now } : null));
    }

    setToastMessage(`Incident ${alertId} updated to ${newStatus}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReassignOwner = (alertId: string, newOwnerId: string, note?: string) => {
    const newOwner = users.find((u) => u.id === newOwnerId);
    if (!newOwner) return;

    const now = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          ownerId: newOwner.id,
          ownerName: newOwner.name,
          ownerRole: newOwner.role,
          updatedAt: now,
          activityLog: [
            ...a.activityLog,
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              userId: currentUser.id,
              userName: currentUser.name,
              userRole: currentUser.role,
              action: 'Assigned',
              comment: note || `Reassigned from ${a.ownerName} to ${newOwner.name} (${newOwner.role}) by ${currentUser.name}.`,
            },
          ],
        };
      })
    );

    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert((prev) =>
        prev
          ? {
              ...prev,
              ownerId: newOwner.id,
              ownerName: newOwner.name,
              ownerRole: newOwner.role,
              updatedAt: now,
            }
          : null
      );
    }
  };

  const handleAddComment = (alertId: string, comment: string) => {
    const now = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        const newLogEntry = {
          id: `act-${Date.now()}`,
          timestamp: now,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'CommentAdded' as const,
          comment: comment,
        };
        const updatedLog = [...a.activityLog, newLogEntry];

        return {
          ...a,
          updatedAt: now,
          activityLog: updatedLog,
        };
      })
    );

    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert((prev) =>
        prev
          ? {
              ...prev,
              activityLog: [
                ...prev.activityLog,
                {
                  id: `act-${Date.now()}`,
                  timestamp: now,
                  userId: currentUser.id,
                  userName: currentUser.name,
                  userRole: currentUser.role,
                  action: 'CommentAdded',
                  comment,
                },
              ],
            }
          : null
      );
    }
  };

  const handleIsolatePort = (alertId: string, switchId: string, port: number) => {
    const now = new Date().toISOString();
    // Update alert
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          updatedAt: now,
          activityLog: [
            ...a.activityLog,
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              userId: currentUser.id,
              userName: currentUser.name,
              userRole: currentUser.role,
              action: 'PortIsolated',
              comment: `Physical quarantine command executed: Port ${switchId}:P${port} disabled via SNMP management interface.`,
            },
          ],
        };
      })
    );

    // Update devices on that switch port to quarantined
    setDevices((prev) =>
      prev.map((d) => {
        if (d.switchId === switchId && d.switchPort === port) {
          return { ...d, status: 'Quarantined' };
        }
        return d;
      })
    );

    setToastMessage(`Switch port ${switchId}:P${port} successfully isolated.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleDeviceStatus = (deviceId: string, newStatus: 'Authorized' | 'Rogue' | 'Quarantined') => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d))
    );
    setToastMessage(`Device status updated to ${newStatus}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulation Injection via IncidentMappingEngine
  const handleInjectScenario = (scen: (typeof SIMULATION_SCENARIOS)[0]) => {
    const rawInput: RawNetworkEventInput = {
      eventType: scen.eventType,
      sourceIp: scen.ip,
      sourceMac: scen.mac,
      switchId: scen.switchId,
      switchPort: scen.port,
      protocol: scen.protocol,
      trafficRate: '48.5 KB/s anomalous peak',
    };

    const newAlert = IncidentMappingEngine.mapEventToIncident(rawInput);
    setAlerts((prev) => [newAlert, ...prev]);

    // Also register or update device
    setDevices((prev) => [
      {
        id: `dev-${Date.now()}`,
        mac: scen.mac,
        ip: scen.ip,
        hostname: `SUSPICIOUS-${scen.mac.slice(-5).replace(':', '')}`,
        firstSeen: 'Just now',
        lastSeen: 'Just now',
        switchId: scen.switchId,
        switchPort: scen.port,
        status: 'Rogue',
        assignedLineId: scen.lineId,
        assignedMachineId: scen.machineId,
        vendor: 'Unverified Hardware',
        deviceType: 'Rogue Connection',
      },
      ...prev,
    ]);

    setToastMessage(`New Alert: ${newAlert.title}`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleInjectCustomEvent = (rawEvent: RawNetworkEventInput) => {
    const newAlert = IncidentMappingEngine.mapEventToIncident(rawEvent);
    setAlerts((prev) => [newAlert, ...prev]);
    setToastMessage(`Mapped Event: ${newAlert.title}`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetData = () => {
    setAlerts(INITIAL_ALERTS);
    setDevices(INITIAL_DEVICES);
    setLines(PRODUCTION_LINES);
    setToastMessage('Factory data reset to factory initial state.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered alerts for the Alerts tab
  const filteredAlerts = alerts.filter((a) => {
    const matchesSev = alertSeverityFilter === 'all' || a.severity === alertSeverityFilter;
    const matchesStatus = alertStatusFilter === 'all' || a.status === alertStatusFilter;
    const matchesLine = alertLineFilter === 'all' || a.lineId === alertLineFilter;
    const matchesOwner = !onlyMyAlerts || a.ownerId === currentUser.id;
    return matchesSev && matchesStatus && matchesLine && matchesOwner;
  });

  const openCount = alerts.filter((a) => a.status === 'Open').length;
  const criticalCount = alerts.filter((a) => a.severity === 'Critical' && a.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col pb-20 lg:pb-8">
      {/* Top Bar Contract Compliant Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        users={users}
        onSelectUser={setCurrentUser}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        openCount={openCount}
        criticalCount={criticalCount}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 p-3 sm:p-4 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="text-xs leading-snug flex-1 font-medium">{toastMessage}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* VIEW 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* High-level Risk & Production Downtime metrics */}
            <RiskOverview
              alerts={alerts}
              lines={lines}
              onQuickFilterCritical={() => {
                setActiveTab('alerts');
                setAlertSeverityFilter('Critical');
              }}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />

            {/* Industrial Plant Overview with Generated Asset Graphic */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#111c33] p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
                      Operational Context Engine
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">IEC 62443 Zone & Conduit Defense</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Connecting Shop-Floor OT Realities with Cyber Risk
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    FactoryShield translates cryptic IP/MAC anomalies directly into affected production lines,
                    assigned shift supervisors, and projected downtime costs. No guesswork during shift transitions.
                  </p>
                  
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab('incidents')}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Manage Incident Queue <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsSimulatorOpen(true)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Test Attack Scenarios
                    </button>
                  </div>
                </div>

                {/* High-quality Industrial Plant Image with Fail-safe styling */}
                <div className="w-full lg:w-80 h-44 rounded-xl overflow-hidden relative border border-slate-700/60 shadow-inner shrink-0 group">
                  <img
                    src="/src/assets/images/smart_factory_overview_1793340104036.jpg"
                    alt="Smart factory floor robotics and automated production line"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Graceful fallback if image load fails
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                    <div className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Facility OT Network Grid Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Floor Production Line Security Status Grid */}
            <LineStatusGrid
              lines={lines}
              alerts={alerts}
              users={users}
              onSelectLine={(lineId) => {
                setActiveTab('alerts');
                setAlertLineFilter(lineId);
              }}
              onSelectAlert={(a) => setSelectedAlert(a)}
            />

            {/* Recent High Priority Alerts Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-orange-400" />
                    Active Cyber Alerts Requiring Verification ({alerts.filter((a) => a.status !== 'Resolved').length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Incidents prioritized by immediate downtime risk and affected manufacturing machinery.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  View All Alerts <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts
                  .filter((a) => a.status !== 'Resolved')
                  .slice(0, 4)
                  .map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      currentUser={currentUser}
                      onOpenDetails={(a) => setSelectedAlert(a)}
                      onAcknowledge={handleAcknowledgeAlert}
                      onEscalate={handleEscalateAlert}
                      onResolve={(id) => handleResolveAlert(id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ALERTS FEED */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-xl bg-[#111c33] border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-cyan-400" />
                    Operations Cyber Threat Stream
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time alerts with operational translation, downtime hazard estimation, and operator playbooks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyMyAlerts}
                      onChange={(e) => setOnlyMyAlerts(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span>My Assigned Line Only ({currentUser.name})</span>
                  </label>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <select
                  value={alertSeverityFilter}
                  onChange={(e) => setAlertSeverityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="all">All Severities (Critical, High, Med, Low)</option>
                  <option value="Critical">Critical Severity</option>
                  <option value="High">High Severity</option>
                  <option value="Medium">Medium Severity</option>
                  <option value="Low">Low Severity</option>
                </select>

                <select
                  value={alertStatusFilter}
                  onChange={(e) => setAlertStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={alertLineFilter}
                  onChange={(e) => setAlertLineFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="all">All Production Lines</option>
                  {lines.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Alert Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlerts.length === 0 ? (
                <div className="col-span-2 p-12 text-center rounded-xl bg-[#111c33] border border-slate-800 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-white font-bold text-sm">No Matching Security Alerts</h4>
                  <p className="text-xs">
                    No active cyber events match your current filter settings. You can reset filters or trigger a simulated attack scenario.
                  </p>
                  <button
                    onClick={() => {
                      setAlertSeverityFilter('all');
                      setAlertStatusFilter('all');
                      setAlertLineFilter('all');
                      setOnlyMyAlerts(false);
                    }}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    Reset Filter Options
                  </button>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    currentUser={currentUser}
                    onOpenDetails={(a) => setSelectedAlert(a)}
                    onAcknowledge={handleAcknowledgeAlert}
                    onEscalate={handleEscalateAlert}
                    onResolve={(id) => handleResolveAlert(id)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: INCIDENT MANAGEMENT */}
        {activeTab === 'incidents' && (
          <IncidentManagementView
            alerts={alerts}
            users={users}
            lines={lines}
            currentUser={currentUser}
            onOpenDetails={(a) => setSelectedAlert(a)}
            onUpdateStatus={handleUpdateStatus}
            onReassignOwner={handleReassignOwner}
          />
        )}

        {/* VIEW 4: PRODUCTION LINES DETAILED ASSET MAP */}
        {activeTab === 'lines' && (
          <div className="space-y-6">
            <LineStatusGrid
              lines={lines}
              alerts={alerts}
              users={users}
              onSelectLine={(lineId) => {
                setActiveTab('alerts');
                setAlertLineFilter(lineId);
              }}
              onSelectAlert={(a) => setSelectedAlert(a)}
            />

            {/* Plant Machinery & Switch Topology Map */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#111c33] border border-slate-800 space-y-4">
              <div>
                <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Detailed Machine-to-Switch Port Mapping Roster
                </h4>
                <p className="text-xs text-slate-400">
                  Physical and logical network topology used by the Incident-to-Operations Mapping Engine.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-x-auto bg-[#0f172a]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Line</th>
                      <th className="p-3">Machine / Asset Name</th>
                      <th className="p-3">Device Type</th>
                      <th className="p-3">Vendor & Model</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Switch & Port</th>
                      <th className="p-3">Criticality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {lines.flatMap((line) =>
                      line.machines.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-semibold text-white whitespace-nowrap">
                            {line.code}
                          </td>
                          <td className="p-3 font-medium text-cyan-300">
                            {m.name}
                          </td>
                          <td className="p-3 whitespace-nowrap">{m.type}</td>
                          <td className="p-3 text-slate-400 whitespace-nowrap">
                            {m.vendor} {m.model}
                          </td>
                          <td className="p-3 font-mono text-slate-300 whitespace-nowrap">{m.ipAddress}</td>
                          <td className="p-3 font-mono text-white whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px]">
                              {m.switchId}:P{m.switchPort}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap font-mono">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                m.criticality === 'High'
                                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                              }`}
                            >
                              {m.criticality}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: NETWORK & SUSPICIOUS TRAFFIC */}
        {activeTab === 'network' && (
          <NetworkMonitorView
            devices={devices}
            onToggleDeviceStatus={handleToggleDeviceStatus}
            onInjectRogueDevice={() => {
              const rogueScen = SIMULATION_SCENARIOS[0];
              handleInjectScenario(rogueScen);
            }}
          />
        )}

        {/* VIEW 6: HISTORICAL INCIDENT AUDIT */}
        {activeTab === 'reports' && (
          <HistoricalReportsView incidents={historicalIncidents} />
        )}
      </main>

      {/* Alert Detail & OT Playbook Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          currentUser={currentUser}
          users={users}
          onClose={() => setSelectedAlert(null)}
          onUpdateStatus={handleUpdateStatus}
          onReassignOwner={handleReassignOwner}
          onAddComment={handleAddComment}
          onIsolatePort={handleIsolatePort}
        />
      )}

      {/* Threat Scenario Simulator Modal */}
      <SimulationControls
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onInjectScenario={handleInjectScenario}
        onInjectCustomEvent={handleInjectCustomEvent}
        onResetData={handleResetData}
      />

      {/* Mobile Responsive Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCount={openCount}
        criticalCount={criticalCount}
      />
    </div>
  );
}
