/**
 * EVENT-BASED NOTIFICATION ENGINE
 */
import { supabase } from '../supabaseClient';
import type { Notification, NotificationType } from '../context/mockData';

export interface NotificationEvent {
    type: NotificationType;
    recipientIds: string[];
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    priority?: string;
}

export const dispatchNotification = async (event: NotificationEvent): Promise<Notification[]> => {
    const notifications: Notification[] = event.recipientIds.map(userId => ({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        user_id: userId,
        type: event.type,
        title: event.title,
        message: event.message,
        entity_type: event.entityType,
        entity_id: event.entityId,
        is_read: false,
        priority: event.priority || 'NORMAL',
        created_at: new Date().toISOString(),
    }));
    if (notifications.length > 0) {
        const { error } = await supabase.from('notifications').insert(notifications);
        if (error) console.error('Failed to dispatch notifications:', error);
    }
    return notifications;
};

export const fetchNotifications = async (userId: string, limit = 20): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (error) return [];
    return (data as Notification[]) || [];
};

export const markAsRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
};

export const markAllAsRead = async (userId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
};

export const triggerComplaintCreated = (cId: string, type: string, loc: string, adminIds: string[]) =>
    dispatchNotification({ type: 'complaint_created', recipientIds: adminIds, title: '📋 New Complaint', message: `New ${type.replace('_',' ')} at ${loc}`, entityType: 'complaint', entityId: cId });

export const triggerStaffAssigned = (cId: string, staffId: string, userId: string, staffName: string) =>
    dispatchNotification({ type: 'assigned', recipientIds: [staffId, userId], title: '👷 Staff Assigned', message: `${staffName} assigned to #${cId}`, entityType: 'complaint', entityId: cId });

export const triggerStatusChanged = (cId: string, newStatus: string, userId: string) =>
    dispatchNotification({ type: 'status_changed', recipientIds: [userId], title: '🔄 Status Updated', message: `#${cId} → ${newStatus}`, entityType: 'complaint', entityId: cId });

export const triggerComplaintCompleted = (cId: string, userId: string) =>
    dispatchNotification({ type: 'completed', recipientIds: [userId], title: '✅ Resolved', message: `#${cId} resolved. Please rate.`, entityType: 'complaint', entityId: cId });

export const triggerEscalation = (cId: string, level: number, adminIds: string[], staffId?: string) =>
    dispatchNotification({ type: 'escalated', recipientIds: staffId ? [...adminIds, staffId] : adminIds, title: '⚠️ Escalated', message: `#${cId} escalated L${level}`, entityType: 'complaint', entityId: cId, priority: 'HIGH' });
