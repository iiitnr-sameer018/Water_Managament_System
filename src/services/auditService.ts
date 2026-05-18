/**
 * AUDIT LOG SERVICE
 * Tracks all system actions for transparency and compliance
 */
import { supabase } from '../supabaseClient';
import type { AuditLog, User } from '../context/mockData';

export type AuditAction =
    | 'COMPLAINT_CREATED'
    | 'COMPLAINT_UPDATED'
    | 'STATUS_CHANGED'
    | 'STAFF_ASSIGNED'
    | 'STAFF_AUTO_ASSIGNED'
    | 'COMPLAINT_RESOLVED'
    | 'COMPLAINT_ESCALATED'
    | 'SLA_BREACHED'
    | 'PRIORITY_CHANGED'
    | 'WORK_NOTES_ADDED'
    | 'ETA_UPDATED'
    | 'RATING_SUBMITTED'
    | 'USER_LOGIN'
    | 'USER_REGISTERED'
    | 'ADMIN_ACTION'
    | 'FILE_UPLOADED'
    | 'FILE_VERSION_CREATED';

export const createAuditLog = async (
    action: AuditAction,
    entityType: string,
    entityId: string | undefined,
    user: User | null,
    details?: Record<string, unknown>,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>
): Promise<AuditLog | null> => {
    const log: AuditLog = {
        id: `al_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        action,
        entity_type: entityType,
        entity_id: entityId,
        user_id: user?.id,
        user_name: user?.name || 'System',
        user_role: user?.role || 'system',
        details: details || {},
        old_values: oldValues,
        new_values: newValues,
        created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('audit_logs').insert([log]);
    if (error) {
        console.error('Failed to create audit log:', error);
        return null;
    }
    return log;
};

export const fetchAuditLogs = async (limit = 50, entityType?: string, entityId?: string): Promise<AuditLog[]> => {
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);
    const { data, error } = await query;
    if (error) { console.error('Failed to fetch audit logs:', error); return []; }
    return (data as AuditLog[]) || [];
};
