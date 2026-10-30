import React, { useState } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  PlusCircle,
  X,
  Server,
  AlertTriangle,
  ChevronDown,
  Cpu,
} from 'lucide-react';
import { SIMULATION_SCENARIOS, PRODUCTION_LINES } from '../data/factoryData';
import { RawNetworkEventInput } from '../services/incidentMapper';

interface SimulationControlsProps {
  isOpen: boolean;
  onClose: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onInjectScenario: (scenario: (typeof SIMULATION_SCENARIOS)[0]) => void;
  onInjectCustomEvent: (event: RawNetworkEventInput) => void;
  onResetData: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isOpen,
  onClose,
  isSimulating,
  onToggleSimulation,
  onInjectScenario,
  onInjectCustomEvent,
  onResetData,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customLineId, setCustomLineId] = useState(PRODUCTION_LINES[0].id);
  const [customMachineId, setCustomMachineId] = useState(PRODUCTION_LINES[0].machines[0].id);
  const [customEventType, setCustomEventType] = useState<'NEW_ROGUE_DEVICE' | 'SUSPICIOUS_TRAFFIC' | 'EXTERNAL_BEACON' | 'MODBUS_SCAN'>('NEW_ROGUE_DEVICE');

  const selectedLine = PRODUCTION_LINES.find((l) => l.id === customLineId);
  const selectedMachine = selectedLine?.machines.find((m) => m.id === customMachineId) || selectedLine?.machines[0];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLine || !selectedMachine) return;

    const rawEvent: RawNetworkEventInput = {
      eventType: customEventType,
      sourceIp: '10.14.99.77',
      targetIp: selectedMachine.ipAddress,
      sourceMac: 'AA:BB:CC:DD:EE:FF',
      switchId: selectedMachine.switchId,
      switchPort: selectedMachine.switchPort,
      protocol: customEventType === 'SUSPICIOUS_TRAFFIC' ? 'Modbus TCP' : 'Ethernet / ARP',
      trafficRate: '22.4 KB/s',
    };

    onInjectCustomEvent(rawEvent);
    setShowCustomForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#131f37] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                OT Cyber Threat & Scenario Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Trigger real-world industrial security events to demonstrate the Incident-to-Operations mapping engine.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Global Simulation Engine Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white text-sm">Background Telemetry Stream</span>
              <p className="text-slate-400">
                When active, the system simulates periodic background network traffic and switch port heartbeats.
              </p>
            </div>

            <button
              onClick={onToggleSimulation}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSimulating
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulating ? 'Active (Click to Pause)' : 'Paused (Click to Resume)'}
            </button>
          </div>

          {/* Predefined Scenarios */}
          <div className="space-y-2.5">
            <div className="text-xs uppercase font-mono font-bold tracking-wider text-cyan-400">
              One-Click Pre-Built Attack Scenarios
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {SIMULATION_SCENARIOS.map((scen) => (
                <div
                  key={scen.id}
                  className="p-3.5 rounded-xl bg-[#111c33] border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          scen.severity === 'Critical'
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                            : 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                        }`}
                      >
                        {scen.severity}
                      </span>
                      <h4 className="font-bold text-white text-xs">{scen.name}</h4>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {scen.description}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Target: {scen.switchId}:P{scen.port} · {scen.protocol}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onInjectScenario(scen);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    Inject Scenario
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Anomaly Builder Toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {showCustomForm ? 'Hide Custom Attack Generator' : 'Build Custom Attack Event'}
            </button>

            {showCustomForm && (
              <form onSubmit={handleCustomSubmit} className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target Production Line</label>
                    <select
                      value={customLineId}
                      onChange={(e) => {
                        setCustomLineId(e.target.value);
                        const line = PRODUCTION_LINES.find((l) => l.id === e.target.value);
                        if (line) setCustomMachineId(line.machines[0].id);
                      }}
                      className="w-full bg-[#111c33] border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
                    >
                      {PRODUCTION_LINES.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target Machine</label>
                    <select
                      value={customMachineId}
                      onChange={(e) => setCustomMachineId(e.target.value)}
                      className="w-full bg-[#111c33] border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
                    >
                      {selectedLine?.machines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Anomaly Type</label>
                    <select
                      value={customEventType}
                      onChange={(e) => setCustomEventType(e.target.value as any)}
                      className="w-full bg-[#111c33] border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
                    >
                      <option value="NEW_ROGUE_DEVICE">NEW_ROGUE_DEVICE (Unknown laptop plugged into switch)</option>
                      <option value="SUSPICIOUS_TRAFFIC">SUSPICIOUS_TRAFFIC (Unauthorized Modbus TCP command spike)</option>
                      <option value="EXTERNAL_BEACON">EXTERNAL_BEACON (Exfiltration connection to internet)</option>
                      <option value="MODBUS_SCAN">MODBUS_SCAN (Reconnaissance port scan)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                >
                  Generate & Map to Operational Alert
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131f37] border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Initial Factory State
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
