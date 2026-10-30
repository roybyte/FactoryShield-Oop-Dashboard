import { PRODUCTION_LINES, INITIAL_USERS, INITIAL_DEVICES } from '../data/factoryData';
import { SecurityAlert, AlertSeverity, IncidentActivity } from '../types/dashboard';

export interface RawNetworkEventInput {
  eventType: 'NEW_ROGUE_DEVICE' | 'SUSPICIOUS_TRAFFIC' | 'MODBUS_SCAN' | 'ANOMALOUS_VOLUME' | 'UNAUTHORIZED_PROTOCOL' | 'EXTERNAL_BEACON';
  timestamp?: string;
  sourceIp: string;
  targetIp?: string;
  sourceMac: string;
  switchId: string;
  switchPort: number;
  protocol: string;
  trafficRate?: string;
  rawPayloadSample?: string;
}

export class IncidentMappingEngine {
  /**
   * Translates a technical network anomaly into an operations-grounded security incident.
   */
  public static mapEventToIncident(event: RawNetworkEventInput): SecurityAlert {
    const timestamp = event.timestamp || new Date().toISOString();
    const alertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Asset & Topology Lookup: Find machine & line based on switch port or IP
    let targetLine = PRODUCTION_LINES.find((l) =>
      l.machines.some((m) => m.switchId === event.switchId && m.switchPort === event.switchPort)
    );

    let targetMachine = targetLine?.machines.find(
      (m) => m.switchId === event.switchId && m.switchPort === event.switchPort
    );

    // Fallback if switch/port wasn't exact match: search by line or default to Line 2
    if (!targetLine || !targetMachine) {
      if (event.switchId.includes('L1')) {
        targetLine = PRODUCTION_LINES[0];
        targetMachine = targetLine.machines[0];
      } else if (event.switchId.includes('L2')) {
        targetLine = PRODUCTION_LINES[1];
        targetMachine = targetLine.machines[0];
      } else if (event.switchId.includes('L3')) {
        targetLine = PRODUCTION_LINES[2];
        targetMachine = targetLine.machines[0];
      } else {
        targetLine = PRODUCTION_LINES[3];
        targetMachine = targetLine.machines[2];
      }
    }

    // 2. Identify Owner: Default to the Shift Supervisor for that line, or Maintenance Lead
    let assignedUser = INITIAL_USERS.find((u) => u.id === targetLine.supervisorId);
    if (!assignedUser) {
      assignedUser = INITIAL_USERS.find((u) => u.role === 'Maintenance Lead') || INITIAL_USERS[0];
    }

    // 3. Severity & Operational Impact Calculation
    let severity: AlertSeverity = 'Medium';
    let title = '';
    let description = '';
    let potentialImpact = '';
    let estimatedDowntime = '';
    let recommendedActions: string[] = [];

    const lineCost = targetLine.hourlyDowntimeCost;

    switch (event.eventType) {
      case 'NEW_ROGUE_DEVICE':
        severity = 'High';
        title = `Unknown Device Plugged into ${targetLine.name} (${targetMachine.name})`;
        description = `An unrecognized hardware device with MAC address ${event.sourceMac} connected to switch ${event.switchId} port ${event.switchPort}. It is probing ${targetMachine.name} and is not in the authorized factory equipment roster.`;
        potentialImpact = `Rogue device has physical Ethernet access to PLC controls. May inject setpoints or interrupt communications. Risk of unplanned line shutdown costing up to $${(lineCost * 0.75).toLocaleString()}.`;
        estimatedDowntime = '30–45 min line stoppage risk';
        recommendedActions = [
          `Send ${assignedUser.name} or on-duty operator to check switch cabinet ${event.switchId} near ${targetMachine.name}.`,
          `Ask nearby personnel if an authorized vendor or technician just connected a diagnostic laptop.`,
          `If unapproved, immediately disconnect switch port ${event.switchPort} or click "Isolate Port" in this dashboard.`,
          `Notify Maintenance Lead Charlie Vance for MAC authentication verification.`,
        ];
        break;

      case 'SUSPICIOUS_TRAFFIC':
        severity = 'Critical';
        title = `Unauthorized Remote Control Traffic to ${targetMachine.name}`;
        description = `High-volume control packets (${event.protocol}) detected targeting ${targetMachine.name} from unexpected address ${event.sourceIp}. Cross-segment policy violation.`;
        potentialImpact = `Immediate hazard: Active override of automated parameters. Could cause physical equipment crash, batch spoilage, or emergency safety trip ($${(lineCost * 2).toLocaleString()} impact).`;
        estimatedDowntime = '1–3 hours critical downtime risk';
        recommendedActions = [
          `Immediately contact ${assignedUser.name} to physically inspect ${targetMachine.name} operating panel.`,
          `Switch machine physical key to "RUN/LOCAL" or "REMOTE LOCK" to prevent network-driven overrides.`,
          `Escalate ticket to IT / SecurePlant Cyber SOC to block source IP ${event.sourceIp}.`,
          `Review recent batch logs to verify chemical/recipe integrity.`,
        ];
        break;

      case 'MODBUS_SCAN':
        severity = 'Medium';
        title = `Automated Network Scanning Detected on ${targetLine.name}`;
        description = `Sequential port/register interrogation detected across ${targetMachine.name} PLC network from IP ${event.sourceIp}. Indicates reconnaissance or misconfigured tool.`;
        potentialImpact = `Reconnaissance scan often precedes targeted disruption. Can saturate low-bandwidth OT serial gateways, causing intermittent sensor drops.`;
        estimatedDowntime = 'Low immediate downtime; high breach risk';
        recommendedActions = [
          `Verify if IT or automation engineers are performing scheduled vulnerability or asset scans.`,
          `Check switch port ${event.switchPort} telemetry to ensure PLC CPU load remains normal.`,
          `If unscheduled, assign to Dave Miller (OT Tech) to isolate offending host.`,
        ];
        break;

      case 'EXTERNAL_BEACON':
        severity = 'High';
        title = `Unapproved External Internet Beacon from ${targetMachine.name}`;
        description = `Machine ${targetMachine.name} initiated outbound encrypted connections to external public server ${event.targetIp || 'external host'} on port ${event.switchPort}.`;
        potentialImpact = `Possible malware command-and-control beacon or exfiltration of production logs. Threat actor could gain remote ingress.`;
        estimatedDowntime = 'Preventive downtime: 45 min security inspection';
        recommendedActions = [
          `Inspect edge gateway / IPC firewall outbound NAT table.`,
          `Verify with vendor ${targetMachine.vendor} if this is an automated cloud telemetry endpoint.`,
          `Escalate to IT / SecurePlant SOC to analyze destination IP threat reputation.`,
          `Isolate gateway internet egress if unverified.`,
        ];
        break;

      default:
        severity = 'Medium';
        title = `Anomalous OT Network Pattern on ${targetMachine.name}`;
        description = `Unusual packet volume or timing observed on switch ${event.switchId} port ${event.switchPort}.`;
        potentialImpact = `Potential communication latency between PLC and SCADA HMI.`;
        estimatedDowntime = '15–30 min diagnostic check';
        recommendedActions = [
          `Check HMI screen for communication error banners.`,
          `Verify network cable seating on switch ${event.switchId}.`,
          `Monitor machine cycle time for irregularities.`,
        ];
    }

    const initialActivity: IncidentActivity = {
      id: `act-${Date.now()}`,
      timestamp: timestamp,
      userId: 'system',
      userName: 'FactoryShield Mapping Engine',
      userRole: 'Automated OT Rule Engine',
      action: 'Created',
      comment: `Event mapped to ${targetLine.name} (${targetMachine.name}) via switch ${event.switchId}:P${event.switchPort}. Assigned initial owner ${assignedUser.name}.`,
    };

    return {
      id: alertId,
      title,
      description,
      severity,
      status: 'Open',
      lineId: targetLine.id,
      lineName: targetLine.name,
      machineId: targetMachine.id,
      machineName: targetMachine.name,
      ownerId: assignedUser.id,
      ownerName: assignedUser.name,
      ownerRole: assignedUser.role,
      potentialImpact,
      estimatedDowntime,
      recommendedActions,
      technicalDetails: {
        eventType: event.eventType,
        sourceIp: event.sourceIp,
        targetIp: event.targetIp || targetMachine.ipAddress,
        sourceMac: event.sourceMac,
        switchId: event.switchId,
        switchPort: event.switchPort,
        protocol: event.protocol,
        trafficRate: event.trafficRate || '14.2 KB/s',
        rawPayloadSample: event.rawPayloadSample || `${event.protocol} traffic frame captured`,
      },
      detectedAt: timestamp,
      updatedAt: timestamp,
      isSimulated: true,
      activityLog: [initialActivity],
    };
  }
}
