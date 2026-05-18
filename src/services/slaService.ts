/**
 * SLA & AUTO-ESCALATION SERVICE
 * Handles SLA deadline calculation, breach detection, and auto-escalation
 */
import type { Complaint, Priority } from '../context/mockData';

// SLA configurations (in hours)
export const SLA_CONFIG: Record<string, Record<Priority, number>> = {
    leakage:      { LOW: 72, NORMAL: 48, HIGH: 24, CRITICAL: 6 },
    no_water:     { LOW: 72, NORMAL: 48, HIGH: 24, CRITICAL: 6 },
    dirty_water:  { LOW: 96, NORMAL: 72, HIGH: 36, CRITICAL: 12 },
    low_pressure: { LOW: 120, NORMAL: 96, HIGH: 48, CRITICAL: 24 },
};

// Escalation thresholds (percentage of SLA time elapsed)
export const ESCALATION_THRESHOLDS = [
    { level: 1, percentElapsed: 50, newPriority: null },       // Warning at 50%
    { level: 2, percentElapsed: 80, newPriority: 'HIGH' as Priority },    // Escalate to HIGH at 80%
    { level: 3, percentElapsed: 100, newPriority: 'CRITICAL' as Priority }, // CRITICAL at 100% (SLA breached)
];

/**
 * Calculate SLA deadline based on complaint type and priority
 */
export const calculateSLADeadline = (type: string, priority: Priority, dateSubmitted: string): string => {
    const config = SLA_CONFIG[type] || SLA_CONFIG['leakage'];
    const hours = config[priority] || 48;
    const deadline = new Date(dateSubmitted);
    deadline.setHours(deadline.getHours() + hours);
    return deadline.toISOString();
};

/**
 * Get SLA status info for a complaint
 */
export const getSLAStatus = (complaint: Complaint): {
    isBreached: boolean;
    percentElapsed: number;
    hoursRemaining: number;
    status: 'safe' | 'warning' | 'danger' | 'breached';
    label: string;
    color: string;
} => {
    if (complaint.status === 'Completed') {
        return { isBreached: false, percentElapsed: 0, hoursRemaining: 0, status: 'safe', label: 'Resolved', color: 'var(--success)' };
    }

    const now = Date.now();
    const submitted = new Date(complaint.dateSubmitted).getTime();
    const deadline = complaint.sla_deadline ? new Date(complaint.sla_deadline).getTime() : submitted + 48 * 3600000;
    const total = deadline - submitted;
    const elapsed = now - submitted;
    const percentElapsed = Math.min(100, Math.round((elapsed / total) * 100));
    const hoursRemaining = Math.max(0, Math.round((deadline - now) / 3600000));

    if (now > deadline) {
        return { isBreached: true, percentElapsed: 100, hoursRemaining: 0, status: 'breached', label: 'SLA BREACHED', color: 'var(--error)' };
    }
    if (percentElapsed >= 80) {
        return { isBreached: false, percentElapsed, hoursRemaining, status: 'danger', label: `${hoursRemaining}h remaining`, color: '#ea580c' };
    }
    if (percentElapsed >= 50) {
        return { isBreached: false, percentElapsed, hoursRemaining, status: 'warning', label: `${hoursRemaining}h remaining`, color: 'var(--warning)' };
    }
    return { isBreached: false, percentElapsed, hoursRemaining, status: 'safe', label: `${hoursRemaining}h remaining`, color: 'var(--success)' };
};

/**
 * Check which complaints need escalation
 */
export const getComplaintsNeedingEscalation = (complaints: Complaint[]): {
    complaint: Complaint;
    requiredLevel: number;
    newPriority: Priority | null;
}[] => {
    const results: { complaint: Complaint; requiredLevel: number; newPriority: Priority | null }[] = [];

    for (const c of complaints) {
        if (c.status === 'Completed') continue;
        const slaStatus = getSLAStatus(c);
        const currentLevel = c.escalation_level || 0;

        for (const threshold of ESCALATION_THRESHOLDS) {
            if (slaStatus.percentElapsed >= threshold.percentElapsed && currentLevel < threshold.level) {
                results.push({
                    complaint: c,
                    requiredLevel: threshold.level,
                    newPriority: threshold.newPriority
                });
                break; // Only escalate to the next level
            }
        }
    }

    return results;
};

/**
 * Format SLA time remaining
 */
export const formatSLATime = (deadline: string): string => {
    const now = Date.now();
    const dl = new Date(deadline).getTime();
    const diff = dl - now;

    if (diff <= 0) return 'Overdue';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);

    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
};
