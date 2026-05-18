// Data types — Enterprise Edition
export type Role = 'user' | 'staff' | 'admin';
export type ComplaintStatus = 'Submitted' | 'Verified' | 'In Progress' | 'Completed';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type NotificationType = 'complaint_created' | 'assigned' | 'status_changed' | 'completed' | 'escalated' | 'sla_warning' | 'system';

export interface User {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    role: Role;
    created_at?: string;
    performance_score?: number;
    is_active?: boolean;
}

export interface Area {
    id: string;
    name: string;
    zone_code: string;
    city: string;
    pincode?: string;
    lat_center?: number;
    lon_center?: number;
    created_at?: string;
}

export interface StaffArea {
    id: string;
    staff_id: string;
    area_id: string;
    is_primary: boolean;
    assigned_at?: string;
}

export interface Complaint {
    id: string;
    userId: string;
    type: string;
    description: string;
    pincode: string;
    location: string;
    lat?: number;
    lon?: number;
    area_id?: string;
    status: ComplaintStatus;
    priority: Priority;
    imageUrl?: string;
    dateSubmitted: string;
    assignedStaffId?: string;
    workNotes?: string;
    eta?: string;
    rating?: number;
    feedback?: string;
    staffImageUrl?: string;
    // SLA fields
    sla_deadline?: string;
    escalation_level?: number;
    escalated_at?: string;
    resolved_at?: string;
    // Assignment metadata
    auto_assigned?: boolean;
    assignment_reason?: string;
}

export interface Rating {
    id: string;
    complaint_id: string;
    user_id: string;
    rating: number; // 1-5
    feedback_text?: string;
    created_at: string;
}

export interface AuditLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    user_id?: string;
    user_name?: string;
    user_role?: string;
    details?: Record<string, unknown>;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    ip_address?: string;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    entity_type?: string;
    entity_id?: string;
    is_read: boolean;
    priority?: string;
    created_at: string;
}

export interface FileVersion {
    id: string;
    complaint_id: string;
    file_url: string;
    file_type: string;
    version_number: number;
    uploaded_by?: string;
    uploaded_at: string;
    is_current: boolean;
}

// ==========================================
// INITIAL MOCK DATA
// ==========================================

export const mockUsers: User[] = [
    { id: '1', name: 'Ravi Kumar (Citizen)', email: 'citizen1@example.com', role: 'user', created_at: new Date().toISOString(), performance_score: 100 },
    { id: '2', name: 'Alisha Sharma (Citizen)', email: 'citizen2@example.com', role: 'user', created_at: new Date().toISOString(), performance_score: 100 },
    { id: '101', name: 'Sameer S. (Maintenance)', email: 'staff1@example.com', role: 'staff', created_at: new Date().toISOString(), performance_score: 92 },
    { id: '102', name: 'Vikas P. (Maintenance)', email: 'staff2@example.com', role: 'staff', created_at: new Date().toISOString(), performance_score: 85 },
    { id: '103', name: 'Anish P. (Maintenance)', email: 'staff3@example.com', role: 'staff', created_at: new Date().toISOString(), performance_score: 78 },
    { id: '999', name: 'Super Admin', email: 'admin@example.com', role: 'admin', created_at: new Date().toISOString(), performance_score: 100 }
];

export const mockAreas: Area[] = [
    { id: 'area_1', name: 'Sector 24', zone_code: 'NR-S24', city: 'Naya Raipur', pincode: '493661', lat_center: 21.1610, lon_center: 81.7870 },
    { id: 'area_2', name: 'Sector 27', zone_code: 'NR-S27', city: 'Naya Raipur', pincode: '493661', lat_center: 21.1540, lon_center: 81.7950 },
    { id: 'area_3', name: 'Uperwara', zone_code: 'NR-UPW', city: 'Naya Raipur', pincode: '493661', lat_center: 21.1350, lon_center: 81.7690 },
    { id: 'area_4', name: 'Rakhi', zone_code: 'NR-RKH', city: 'Naya Raipur', pincode: '493661', lat_center: 21.1480, lon_center: 81.8020 },
    { id: 'area_5', name: 'Atal Nagar', zone_code: 'NR-ATL', city: 'Naya Raipur', pincode: '493661', lat_center: 21.1700, lon_center: 81.7750 },
];

export const mockComplaints: Complaint[] = [
    {
        id: '739421', userId: '1', type: 'leakage',
        description: 'Major pipe burst near the main road causing flooding.',
        pincode: '493661', location: 'Sector 24, Naya Raipur',
        lat: 21.1610, lon: 81.7870, area_id: 'area_1',
        status: 'In Progress', priority: 'HIGH',
        assignedStaffId: '101', imageUrl: '/img/leakage.jpg',
        dateSubmitted: new Date(Date.now() - 86400000).toISOString(),
        sla_deadline: new Date(Date.now() + 43200000).toISOString(),
        escalation_level: 0,
    },
    {
        id: '882190', userId: '2', type: 'dirty_water',
        description: 'Muddy and yellow water coming from the kitchen taps for two days.',
        pincode: '493661', location: 'Sector 27, New Naya Raipur',
        lat: 21.1540, lon: 81.7950, area_id: 'area_2',
        status: 'Verified', priority: 'NORMAL',
        imageUrl: '/img/dirty_water.jpg',
        dateSubmitted: new Date(Date.now() - 43200000).toISOString(),
        sla_deadline: new Date(Date.now() + 129600000).toISOString(),
        escalation_level: 0,
    },
    {
        id: '112233', userId: '1', type: 'no_water',
        description: 'No water supply since yesterday evening in block B.',
        pincode: '493661', location: 'Uperwara, Naya Raipur',
        lat: 21.1350, lon: 81.7690, area_id: 'area_3',
        status: 'Completed', priority: 'NORMAL',
        assignedStaffId: '102',
        dateSubmitted: new Date(Date.now() - 172800000).toISOString(),
        resolved_at: new Date(Date.now() - 86400000).toISOString(),
        sla_deadline: new Date(Date.now() - 86400000).toISOString(),
        escalation_level: 0,
    },
    {
        id: '443322', userId: '2', type: 'low_pressure',
        description: 'Very low water pressure in kitchen and bathroom taps.',
        pincode: '493661', location: 'Atal Nagar, Naya Raipur',
        lat: 21.1700, lon: 81.7750, area_id: 'area_5',
        status: 'Submitted', priority: 'LOW',
        dateSubmitted: new Date(Date.now() - 10800000).toISOString(),
        sla_deadline: new Date(Date.now() + 162000000).toISOString(),
        escalation_level: 0,
    },
    {
        id: '556677', userId: '1', type: 'leakage',
        description: 'Pipe leaking at junction near community park.',
        pincode: '493661', location: 'Rakhi, Naya Raipur',
        lat: 21.1480, lon: 81.8020, area_id: 'area_4',
        status: 'Submitted', priority: 'NORMAL',
        dateSubmitted: new Date(Date.now() - 21600000).toISOString(),
        sla_deadline: new Date(Date.now() + 151200000).toISOString(),
        escalation_level: 0,
    }
];

export const mockRatings: Rating[] = [
    {
        id: 'r_1', complaint_id: '112233', user_id: '1',
        rating: 4, feedback_text: 'Resolved quickly, thanks but staff was a bit late.',
        created_at: new Date(Date.now() - 86400000).toISOString()
    }
];
