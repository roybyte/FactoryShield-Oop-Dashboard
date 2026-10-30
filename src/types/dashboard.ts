export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type AlertStatus = 'Open' | 'Investigating' | 'Resolved' | 'Escalated';

export type RoleType = 'Plant Manager' | 'Shift Supervisor' | 'Maintenance Lead' | 'OT Technician' | 'IT / Security';

export interface User {
  id: string;
  name: string;
  role: RoleType;
  title: string;
  lineId?: string; // Associated production line if supervisor
  avatar?: string;
  email: string;
}

export interface Machine {
  id: string;
  name: string;
  lineId: string;
  type: 'PLC' | 'HMI' | 'Robot Arm' | 'Vision System' | 'Industrial PC' | 'Sensor Gateway' | 'Conveyor VFD';
  ipAddress: string;
  macAddress: string;
  switchId: string;
  switchPort: number;
  criticality: 'High' | 'Medium' | 'Low';
  vendor: string;
  model: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  code: string;
  description: string;
  supervisorId: string;
  status: 'Normal' | 'Warning' | 'Critical Risk';
  activeIncidentCount: number;
  hourlyDowntimeCost: number; // in USD
  machines: Machine[];
}

export interface IncidentActivity {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'Created' | 'Acknowledged' | 'Assigned' | 'StatusChanged' | 'Escalated' | 'CommentAdded' | 'PortIsolated' | 'Resolved';
  comment: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  lineId: string;
  lineName: string;
  machineId: string;
  machineName: string;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  potentialImpact: string;
  estimatedDowntime: string;
  recommendedActions: string[];
  technicalDetails: {
    eventType: string;
    sourceIp: string;
    targetIp?: string;
    sourceMac: string;
    switchId: string;
    switchPort: number;
    protocol: string;
    trafficRate?: string;
    rawPayloadSample?: string;
  };
  detectedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  isSimulated: boolean;
  activityLog: IncidentActivity[];
}

export interface NetworkDevice {
  id: string;
  mac: string;
  ip: string;
  hostname: string;
  firstSeen: string;
  lastSeen: string;
  switchId: string;
  switchPort: number;
  status: 'Authorized' | 'Rogue' | 'Quarantined' | 'Evaluating';
  assignedMachineId?: string;
  assignedLineId?: string;
  vendor: string;
  deviceType: string;
}

export interface NetworkTrafficEvent {
  id: string;
  timestamp: string;
  eventType: 'NEW_DEVICE' | 'SUSPICIOUS_TRAFFIC' | 'MODBUS_SCAN' | 'ANOMALOUS_VOLUME' | 'UNAUTHORIZED_PROTOCOL' | 'EXTERNAL_BEACON';
  sourceIp: string;
  targetIp: string;
  protocol: string;
  bytes: number;
  packets: number;
  switchId: string;
  port: number;
  flagged: boolean;
  notes: string;
}

export interface HistoricalIncident {
  id: string;
  incidentCode: string;
  title: string;
  date: string;
  durationMinutes: number;
  severity: AlertSeverity;
  lineName: string;
  machineName: string;
  resolvedBy: string;
  rootCause: string;
  estimatedLossPrevented: number;
  actionSummary: string;
}
