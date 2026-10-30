import React, { useState } from 'react';
import {
  Server,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  Radio,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { NetworkDevice, NetworkTrafficEvent } from '../types/dashboard';

interface NetworkMonitorViewProps {
  devices: NetworkDevice[];
  onToggleDeviceStatus: (deviceId: string, newStatus: 'Authorized' | 'Rogue' | 'Quarantined') => void;
  onInjectRogueDevice: () => void;
}

export const NetworkMonitorView: React.FC<NetworkMonitorViewProps> = ({
  devices,
  onToggleDeviceStatus,
  onInjectRogueDevice,
}) => {
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'Rogue' | 'Quarantined' | 'Authorized'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample live simulated OT traffic packets
  const simulatedPackets: NetworkTrafficEvent[] = [
    {
      id: 'pkt-1',
      timestamp: 'Just now',
      eventType: 'SUSPICIOUS_TRAFFIC',
      sourceIp: '192.168.10.44',
      targetIp: '10.14.10.21',
      protocol: 'Modbus TCP / FC16',
      bytes: 1480,
      packets: 42,
      switchId: 'SW-L1-OT',
      port: 2,
      flagged: true,
      notes: 'Cross-subnet write commands to Mixer A PLC',
    },
    {
      id: 'pkt-2',
      timestamp: '2s ago',
      eventType: 'NEW_DEVICE',
      sourceIp: '10.14.20.198',
      targetIp: '10.14.20.15',
      protocol: 'ARP Broadcast',
      bytes: 64,
      packets: 8,
      switchId: 'SW-L2-OT',
      port: 5,
      flagged: true,
      notes: 'Unknown ASUSTek MAC address broadcasting near Packer B',
    },
    {
      id: 'pkt-3',
      timestamp: '5s ago',
      eventType: 'EXTERNAL_BEACON',
      sourceIp: '10.14.40.90',
      targetIp: '185.220.101.5',
      protocol: 'TLS 1.3 / TCP 8443',
      bytes: 12400,
      packets: 26,
      switchId: 'SW-L4-OT',
      port: 8,
      flagged: true,
      notes: 'Outbound cloud sync to unapproved European IP',
    },
    {
      id: 'pkt-4',
      timestamp: '8s ago',
      eventType: 'UNAUTHORIZED_PROTOCOL',
      sourceIp: '10.14.20.15',
      targetIp: '10.14.20.18',
      protocol: 'EtherNet/IP CIP',
      bytes: 256,
      packets: 120,
      switchId: 'SW-L2-OT',
      port: 6,
      flagged: false,
      notes: 'Normal robot arm kinematic sync telemetry',
    },
    {
      id: 'pkt-5',
      timestamp: '12s ago',
      eventType: 'MODBUS_SCAN',
      sourceIp: '10.14.30.12',
      targetIp: '10.14.30.16',
      protocol: 'Sysmac FINS',
      bytes: 512,
      packets: 18,
      switchId: 'SW-L3-OT',
      port: 3,
      flagged: false,
      notes: 'Filling carousel and capper synchronization heartbeat',
    },
  ];

  const filteredDevices = devices.filter((dev) => {
    const matchesFilter = deviceFilter === 'all' || dev.status === deviceFilter;
    const matchesSearch =
      dev.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const rogueCount = devices.filter((d) => d.status === 'Rogue').length;
  const quarantinedCount = devices.filter((d) => d.status === 'Quarantined').length;

  return (
    <div className="space-y-5">
      {/* Overview & Live stream header */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#111c33] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Factory Network Subnets & Switch Port Tap
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-blue-500/30">
              SIMULATED OT TAP
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Suspicious Device Connections & OT Traffic Inspector
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Continuous passive packet inspection across Hirschmann industrial switches SW-L1 through SW-L4.
            Flags unregistered MAC addresses, unauthorized subnets, and unusual industrial protocols.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <button
            onClick={onInjectRogueDevice}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/20"
          >
            <AlertTriangle className="w-4 h-4" /> Simulate Rogue Connection
          </button>
        </div>
      </div>

      {/* Live Suspicious Network Traffic Feed */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h4 className="font-bold text-white text-sm tracking-tight">
              Real-Time OT Packet Inspection Log (Simulated)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Monitoring 4 Factory VLANs · 10.14.0.0/16
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 rounded-lg bg-[#111c33] border border-slate-800 overflow-hidden text-xs">
          {simulatedPackets.map((pkt) => (
            <div
              key={pkt.id}
              className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                pkt.flagged ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    pkt.flagged
                      ? 'text-rose-400 bg-rose-500/20 border-rose-500/40'
                      : 'text-slate-400 bg-slate-900 border-slate-700'
                  }`}
                >
                  {pkt.flagged ? 'ANOMALY' : 'NORMAL'}
                </span>

                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-cyan-300">{pkt.sourceIp}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-white">{pkt.targetIp}</span>
                    <span className="text-slate-500 font-sans">({pkt.protocol})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{pkt.notes}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono shrink-0">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {pkt.switchId}:P{pkt.port}
                </span>
                <span>{pkt.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Industrial Equipment & Device Inventory */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#111c33] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Connected Equipment & MAC Whitelist Inventory ({devices.length} Devices)
            </h4>
            <p className="text-xs text-slate-400">
              Only authorized industrial PLCs, HMIs, and robot controllers should occupy shop-floor switch ports.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setDeviceFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                deviceFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All ({devices.length})
            </button>
            <button
              onClick={() => setDeviceFilter('Rogue')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                deviceFilter === 'Rogue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 text-rose-400 hover:bg-slate-800'
              }`}
            >
              Rogue ({rogueCount})
            </button>
            <button
              onClick={() => setDeviceFilter('Quarantined')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                deviceFilter === 'Quarantined'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-purple-400 hover:bg-slate-800'
              }`}
            >
              Quarantined ({quarantinedCount})
            </button>
            <button
              onClick={() => setDeviceFilter('Authorized')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                deviceFilter === 'Authorized'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
              }`}
            >
              Authorized
            </button>
          </div>
        </div>

        {/* Device Table */}
        <div className="rounded-xl border border-slate-800 overflow-x-auto bg-[#0f172a]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Device & Hostname</th>
                <th className="p-3">MAC / IP Address</th>
                <th className="p-3">Switch Port</th>
                <th className="p-3">Vendor / Type</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Shop-Floor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDevices.map((dev) => (
                <tr
                  key={dev.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    dev.status === 'Rogue' ? 'bg-rose-950/20' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {dev.status === 'Rogue' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      {dev.hostname}
                    </div>
                    <div className="text-[11px] text-slate-400">{dev.deviceType}</div>
                  </td>
                  <td className="p-3 font-mono">
                    <div className="text-cyan-300 font-bold">{dev.ip}</div>
                    <div className="text-[10px] text-slate-400">{dev.mac}</div>
                  </td>
                  <td className="p-3 font-mono whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                      {dev.switchId} : Port {dev.switchPort}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="text-white">{dev.vendor}</div>
                    <div className="text-[10px] text-slate-400">Seen: {dev.lastSeen}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap font-mono">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        dev.status === 'Authorized'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                          : dev.status === 'Rogue'
                          ? 'text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse'
                          : 'text-purple-400 bg-purple-500/15 border-purple-500/30'
                      }`}
                    >
                      {dev.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-right">
                    {dev.status === 'Rogue' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleDeviceStatus(dev.id, 'Quarantined')}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" /> Isolate Port
                        </button>
                        <button
                          onClick={() => onToggleDeviceStatus(dev.id, 'Authorized')}
                          className="px-2 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          Whitelist
                        </button>
                      </div>
                    ) : dev.status === 'Quarantined' ? (
                      <button
                        onClick={() => onToggleDeviceStatus(dev.id, 'Authorized')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Unlock className="w-3 h-3" /> Reconnect Port
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleDeviceStatus(dev.id, 'Quarantined')}
                        className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-auto"
                      >
                        Quarantine
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
