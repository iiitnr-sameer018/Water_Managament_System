/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, Complaint, ComplaintStatus, Rating, AuditLog, Notification, Area, StaffArea, Priority } from './mockData';
import { supabase } from '../supabaseClient';
import { createAuditLog, fetchAuditLogs } from '../services/auditService';
import { calculateSLADeadline, getComplaintsNeedingEscalation } from '../services/slaService';
import { findBestStaff } from '../services/assignmentEngine';
import { triggerComplaintCreated, triggerStaffAssigned, triggerStatusChanged, triggerComplaintCompleted, triggerEscalation, fetchNotifications, markAsRead as markNotifRead, markAllAsRead as markAllNotifsRead } from '../services/notificationEngine';
import { checkRateLimit } from '../services/rateLimiter';
import { recordMetric } from '../services/healthMonitor';

// --- Auth Context ---
interface AuthContextType {
    user: User | null;
    login: (email: string, name: string) => Promise<void>;
    logout: () => void;
    register: (userData: Omit<User, 'id' | 'role' | 'created_at'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

// --- Data Context ---
interface DataContextType {
    complaints: Complaint[];
    users: User[];
    ratings: Rating[];
    auditLogs: AuditLog[];
    notifications: Notification[];
    areas: Area[];
    staffAreas: StaffArea[];
    addComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'dateSubmitted' | 'priority'> & { priority?: Priority }) => Promise<string>;
    updateComplaintStatus: (id: string, status: ComplaintStatus) => Promise<void>;
    addWorkNotes: (id: string, notes: string) => Promise<void>;
    updateETA: (id: string, eta: string) => Promise<void>;
    assignStaff: (complaintId: string, staffId: string) => Promise<void>;
    autoAssignStaff: (complaintId: string) => Promise<string | null>;
    rateComplaint: (id: string, rating: number, feedback?: string) => Promise<void>;
    addStaffPhoto: (id: string, imageUrl: string) => Promise<void>;
    updatePriority: (id: string, priority: Priority) => Promise<void>;
    addStaffMember: (name: string, email: string, phone?: string) => Promise<void>;
    removeStaffMember: (staffId: string) => Promise<void>;
    refreshAuditLogs: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    markNotificationRead: (id: string) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;
    runEscalationCheck: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
};

// --- Combined Provider ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
    const [allRatings, setAllRatings] = useState<Rating[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [staffAreas, setStaffAreas] = useState<StaffArea[]>([]);
    const escalationRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            const start = performance.now();
            const [usersRes, complaintsRes, ratingsRes, areasRes, staffAreasRes] = await Promise.all([
                supabase.from('users').select('*'),
                supabase.from('complaints').select('*').order('dateSubmitted', { ascending: false }),
                supabase.from('ratings').select('*'),
                supabase.from('areas').select('*'),
                supabase.from('staff_areas').select('*'),
            ]);
            recordMetric('db_latency', performance.now() - start, 'ms');
            if (usersRes.data) setAllUsers(usersRes.data);
            if (complaintsRes.data) setAllComplaints(complaintsRes.data);
            if (ratingsRes.data) setAllRatings(ratingsRes.data);
            if (areasRes.data) setAreas(areasRes.data);
            if (staffAreasRes.data) setStaffAreas(staffAreasRes.data);
        };
        fetchData();
    }, []);

    // Load audit logs & notifications when user logs in
    useEffect(() => {
        if (currentUser) {
            fetchAuditLogs(50).then(setAuditLogs);
            fetchNotifications(currentUser.id, 30).then(setNotifications);
        }
    }, [currentUser]);

    // Auto-escalation check every 60 seconds
    useEffect(() => {
        if (currentUser?.role === 'admin') {
            escalationRef.current = setInterval(() => {
                runEscalationCheck();
            }, 60000);
        }
        return () => { if (escalationRef.current) clearInterval(escalationRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // Realtime Subscriptions
    useEffect(() => {
        const channel = supabase
            .channel('all-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setAllComplaints(prev => {
                        if (prev.find(c => c.id === payload.new.id)) return prev;
                        return [payload.new as Complaint, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setAllComplaints(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c));
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                if (currentUser && payload.new.user_id === currentUser.id) {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [currentUser]);

    // === Auth Actions ===
    const login = async (email: string, name: string) => {
        const rl = checkRateLimit(email, 'login_attempt');
        if (!rl.allowed) { alert(`Too many login attempts. Try again in ${Math.ceil(rl.resetIn / 60000)} minutes.`); return; }

        const { data: users } = await supabase.from('users').select('*').eq('email', email);
        let user = users?.[0];
        if (!user) {
            const baseUser = { id: Date.now().toString(), email, name, role: 'user' as const, created_at: new Date().toISOString() };
            const fullUser = { ...baseUser, performance_score: 100, is_active: true };
            
            const { data: insertedUsers, error } = await supabase.from('users').insert([fullUser]).select();
            
            if (error) {
                if (error.message.includes('column') || error.code === '42703') {
                    console.warn("Retrying login insert with only base columns:", error.message);
                    const { data: retryUsers, error: retryError } = await supabase.from('users').insert([baseUser]).select();
                    if (retryError) { alert("Failed to create user: " + retryError.message); throw new Error(retryError.message); }
                    user = retryUsers?.[0] || baseUser;
                } else {
                    alert("Failed to create user: " + error.message); throw new Error(error.message);
                }
            } else {
                user = insertedUsers?.[0] || fullUser;
            }
            
            setAllUsers(prev => [...prev, user]);
            createAuditLog('USER_REGISTERED', 'user', user.id, user, { email });
        } else {
            createAuditLog('USER_LOGIN', 'user', user.id, user, { email });
        }
        setCurrentUser(user);
    };

    const logout = () => { setCurrentUser(null); setNotifications([]); };

    const register = async (userData: Omit<User, 'id' | 'role' | 'created_at'>) => {
        const baseUser = { ...userData, id: Date.now().toString(), role: 'user' as const, created_at: new Date().toISOString() };
        const fullUser = { ...baseUser, performance_score: 100, is_active: true };
        
        const { data: insertedUsers, error } = await supabase.from('users').insert([fullUser]).select();
        
        let user;
        if (error) {
            if (error.message.includes('column') || error.code === '42703') {
                console.warn("Retrying register insert with only base columns:", error.message);
                const { data: retryUsers, error: retryError } = await supabase.from('users').insert([baseUser]).select();
                if (retryError) { alert("Failed to register: " + retryError.message); throw new Error(retryError.message); }
                user = retryUsers?.[0] || baseUser;
            } else {
                alert("Failed to register: " + error.message); throw new Error(error.message);
            }
        } else {
            user = insertedUsers?.[0] || fullUser;
        }
        
        setAllUsers(prev => [...prev, user]);
        setCurrentUser(user);
        createAuditLog('USER_REGISTERED', 'user', user.id, user);
    };

    // === Data Actions ===
    const addComplaint = async (complaintData: Omit<Complaint, 'id' | 'status' | 'dateSubmitted' | 'priority'> & { priority?: Priority }) => {
        if (currentUser) {
            const rl = checkRateLimit(currentUser.id, 'complaint_submit');
            if (!rl.allowed) { throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(rl.resetIn / 60000)} minutes.`); }
        }

        const priority = complaintData.priority || 'NORMAL';
        const dateSubmitted = new Date().toISOString();
        const sla_deadline = calculateSLADeadline(complaintData.type, priority, dateSubmitted);

        const newComplaint: Complaint = {
            ...complaintData,
            id: Math.floor(100000 + Math.random() * 900000).toString(),
            status: 'Submitted',
            priority,
            dateSubmitted,
            sla_deadline,
            escalation_level: 0,
        };

        setAllComplaints(prev => [newComplaint, ...prev]);
        const { error } = await supabase.from('complaints').insert([newComplaint]);
        if (error) {
            setAllComplaints(prev => prev.filter(c => c.id !== newComplaint.id));
            throw new Error(error.message || "Failed to insert complaint");
        }

        createAuditLog('COMPLAINT_CREATED', 'complaint', newComplaint.id, currentUser, { type: newComplaint.type, location: newComplaint.location, priority });
        const adminIds = allUsers.filter(u => u.role === 'admin').map(u => u.id);
        triggerComplaintCreated(newComplaint.id, newComplaint.type, newComplaint.location, adminIds);

        return newComplaint.id;
    };

    const updateComplaintStatus = async (id: string, status: ComplaintStatus) => {
        const complaint = allComplaints.find(c => c.id === id);
        const oldStatus = complaint?.status;
        const updates: Partial<Complaint> = { status };
        if (status === 'Completed') updates.resolved_at = new Date().toISOString();

        setAllComplaints(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        await supabase.from('complaints').update(updates).eq('id', id);

        createAuditLog('STATUS_CHANGED', 'complaint', id, currentUser, { from: oldStatus, to: status });
        if (complaint?.userId) {
            triggerStatusChanged(id, status, complaint.userId);
            if (status === 'Completed') triggerComplaintCompleted(id, complaint.userId);
        }
    };

    const addWorkNotes = async (id: string, notes: string) => {
        setAllComplaints(prev => prev.map(c => c.id === id ? { ...c, workNotes: notes } : c));
        await supabase.from('complaints').update({ workNotes: notes }).eq('id', id);
        createAuditLog('WORK_NOTES_ADDED', 'complaint', id, currentUser, { notes });
    };

    const updateETA = async (id: string, eta: string) => {
        setAllComplaints(prev => prev.map(c => c.id === id ? { ...c, eta } : c));
        await supabase.from('complaints').update({ eta }).eq('id', id);
        createAuditLog('ETA_UPDATED', 'complaint', id, currentUser, { eta });
    };

    const assignStaff = async (id: string, staffId: string) => {
        setAllComplaints(prev => prev.map(c => c.id === id ? { ...c, assignedStaffId: staffId, auto_assigned: false } : c));
        await supabase.from('complaints').update({ assignedStaffId: staffId, auto_assigned: false }).eq('id', id);
        const staff = allUsers.find(u => u.id === staffId);
        const complaint = allComplaints.find(c => c.id === id);
        createAuditLog('STAFF_ASSIGNED', 'complaint', id, currentUser, { staffId, staffName: staff?.name });
        if (complaint?.userId && staff) triggerStaffAssigned(id, staffId, complaint.userId, staff.name || 'Staff');
    };

    const autoAssignStaff = async (complaintId: string): Promise<string | null> => {
        const complaint = allComplaints.find(c => c.id === complaintId);
        if (!complaint) return null;
        const staffMembers = allUsers.filter(u => u.role === 'staff');
        const result = findBestStaff(complaint, staffMembers, allComplaints, staffAreas, areas);
        if (!result) return null;

        setAllComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, assignedStaffId: result.staffId, auto_assigned: true, assignment_reason: result.reason } : c));
        await supabase.from('complaints').update({ assignedStaffId: result.staffId, auto_assigned: true, assignment_reason: result.reason }).eq('id', complaintId);
        createAuditLog('STAFF_AUTO_ASSIGNED', 'complaint', complaintId, currentUser, { staffId: result.staffId, reason: result.reason, score: result.score });
        const staff = allUsers.find(u => u.id === result.staffId);
        if (complaint.userId && staff) triggerStaffAssigned(complaintId, result.staffId, complaint.userId, staff.name || 'Staff');
        return result.staffId;
    };

    const updatePriority = async (id: string, priority: Priority) => {
        const complaint = allComplaints.find(c => c.id === id);
        const oldPriority = complaint?.priority;
        const sla_deadline = complaint ? calculateSLADeadline(complaint.type, priority, complaint.dateSubmitted) : undefined;
        setAllComplaints(prev => prev.map(c => c.id === id ? { ...c, priority, sla_deadline } : c));
        await supabase.from('complaints').update({ priority, sla_deadline }).eq('id', id);
        createAuditLog('PRIORITY_CHANGED', 'complaint', id, currentUser, { from: oldPriority, to: priority });
    };

    const rateComplaint = async (id: string, rating: number, feedback?: string) => {
        const uid = currentUser?.id || 'unknown';
        const newRating: Rating = { id: 'r_' + Date.now(), complaint_id: id, user_id: uid, rating, feedback_text: feedback, created_at: new Date().toISOString() };
        setAllRatings(prev => [...prev, newRating]);
        await supabase.from('ratings').insert([newRating]);
        createAuditLog('RATING_SUBMITTED', 'complaint', id, currentUser, { rating, feedback });
    };

    const addStaffPhoto = async (id: string, imageUrl: string) => {
        setAllComplaints(prev => prev.map(c => c.id === id ? { ...c, staffImageUrl: imageUrl } : c));
        await supabase.from('complaints').update({ staffImageUrl: imageUrl }).eq('id', id);
        createAuditLog('FILE_UPLOADED', 'complaint', id, currentUser, { type: 'staff_proof_photo' });
    };

    const addStaffMember = async (name: string, email: string, phone?: string) => {
        const { data: existing } = await supabase.from('users').select('*').eq('email', email);
        if (existing && existing.length > 0) { throw new Error('A user with this email already exists.'); }
        
        const staffId = Date.now().toString();
        const createdAt = new Date().toISOString();
        
        // Essential fields that definitely exist in the basic users table
        const baseData = { 
            id: staffId, 
            email, 
            name, 
            role: 'staff' as const, 
            created_at: createdAt
        };

        // Attempt full insert with all extended fields
        const fullData = { 
            ...baseData, 
            phone, 
            is_active: true, 
            performance_score: 100 
        };

        const { error } = await supabase.from('users').insert([fullData]);

        if (error) {
            // If it failed because of missing columns, retry with ONLY essential fields
            if (error.message.includes('column') || error.code === '42703') {
                console.warn("Retrying insert with only base columns due to schema mismatch:", error.message);
                const { error: retryError } = await supabase.from('users').insert([baseData]);
                if (retryError) throw new Error(`Database Error: ${retryError.message}`);
            } else {
                throw new Error(`Failed to add staff: ${error.message}`);
            }
        }
        
        // Update local state with whatever data we managed to save
        const newStaff: User = { ...fullData }; 
        setAllUsers(prev => [...prev, newStaff]);
        
        // Attempt to log but don't block UI if audit logs table is missing
        try {
            await createAuditLog('STAFF_ADDED', 'user', staffId, currentUser, { name, email, phone });
        } catch (e) {
            console.error("Audit log failed (table might be missing):", e);
        }
    };

    const removeStaffMember = async (staffId: string) => {
        const staff = allUsers.find(u => u.id === staffId);
        if (!staff) return;

        try {
            // 1. Delete from database
            const { error } = await supabase.from('users').delete().eq('id', staffId);
            if (error) throw new Error(`Database Error: ${error.message}`);

            // 2. Update local state
            setAllUsers(prev => prev.filter(u => u.id !== staffId));

            // 3. Unassign this staff from any active complaints (handled by foreign key SET NULL in DB, but sync local state)
            setAllComplaints(prev => prev.map(c => 
                c.assignedStaffId === staffId ? { ...c, assignedStaffId: undefined, auto_assigned: false } : c
            ));

            // 4. Create Audit Log
            try {
                await createAuditLog('STAFF_REMOVED', 'user', staffId, currentUser, { name: staff.name, email: staff.email });
            } catch (e) {
                console.error("Audit log failed:", e);
            }

            console.log(`Staff member ${staff.name} removed successfully.`);
        } catch (error: any) {
            console.error("Removal failed:", error);
            throw new Error(error.message || 'Failed to remove staff');
        }
    };

    const refreshAuditLogs = useCallback(async () => {
        const logs = await fetchAuditLogs(50);
        setAuditLogs(logs);
    }, []);

    const refreshNotifications = useCallback(async () => {
        if (!currentUser) return;
        const notifs = await fetchNotifications(currentUser.id, 30);
        setNotifications(notifs);
    }, [currentUser]);

    const markNotificationRead = useCallback(async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await markNotifRead(id);
    }, []);

    const markAllNotificationsRead = useCallback(async () => {
        if (!currentUser) return;
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        await markAllNotifsRead(currentUser.id);
    }, [currentUser]);

    const runEscalationCheck = useCallback(async () => {
        const escalations = getComplaintsNeedingEscalation(allComplaints);
        const adminIds = allUsers.filter(u => u.role === 'admin').map(u => u.id);

        for (const esc of escalations) {
            const updates: Partial<Complaint> = { escalation_level: esc.requiredLevel, escalated_at: new Date().toISOString() };
            if (esc.newPriority) updates.priority = esc.newPriority;

            setAllComplaints(prev => prev.map(c => c.id === esc.complaint.id ? { ...c, ...updates } : c));
            await supabase.from('complaints').update(updates).eq('id', esc.complaint.id);
            createAuditLog('COMPLAINT_ESCALATED', 'complaint', esc.complaint.id, currentUser, { level: esc.requiredLevel, newPriority: esc.newPriority });
            triggerEscalation(esc.complaint.id, esc.requiredLevel, adminIds, esc.complaint.assignedStaffId);
        }
    }, [allComplaints, allUsers, currentUser]);

    return (
        <AuthContext.Provider value={{ user: currentUser, login, logout, register }}>
            <DataContext.Provider value={{
                complaints: allComplaints, users: allUsers, ratings: allRatings,
                auditLogs, notifications, areas, staffAreas,
                addComplaint, updateComplaintStatus, addWorkNotes, updateETA,
                assignStaff, autoAssignStaff, rateComplaint, addStaffPhoto,
                updatePriority, addStaffMember, removeStaffMember,
                refreshAuditLogs, refreshNotifications,
                markNotificationRead, markAllNotificationsRead, runEscalationCheck,
            }}>
                {children}
            </DataContext.Provider>
        </AuthContext.Provider>
    );
};
