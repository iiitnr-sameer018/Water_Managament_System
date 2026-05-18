/**
 * SMART STAFF ASSIGNMENT ENGINE
 * Auto-assigns staff based on: Area match → Workload → Performance rating
 */
import type { Complaint, User, StaffArea, Area } from '../context/mockData';

export interface StaffWorkload {
    staffId: string;
    staffName: string;
    activeComplaints: number;
    totalComplaints: number;
    resolvedComplaints: number;
    performanceScore: number;
    primaryAreas: string[];
    allAreas: string[];
    score: number; // Final computed assignment score (lower = better candidate)
}

/**
 * Calculate workload for all staff members
 */
export const calculateStaffWorkloads = (
    staffMembers: User[],
    complaints: Complaint[],
    staffAreas: StaffArea[],
    areas: Area[]
): StaffWorkload[] => {
    return staffMembers.map(staff => {
        const staffComplaints = complaints.filter(c => c.assignedStaffId === staff.id);
        const activeComplaints = staffComplaints.filter(c => c.status !== 'Completed').length;
        const resolvedComplaints = staffComplaints.filter(c => c.status === 'Completed').length;

        const staffAreaMappings = staffAreas.filter(sa => sa.staff_id === staff.id);
        const primaryAreaIds = staffAreaMappings.filter(sa => sa.is_primary).map(sa => sa.area_id);
        const allAreaIds = staffAreaMappings.map(sa => sa.area_id);

        const primaryAreaNames = primaryAreaIds.map(id => areas.find(a => a.id === id)?.name || id);
        const allAreaNames = allAreaIds.map(id => areas.find(a => a.id === id)?.name || id);

        return {
            staffId: staff.id,
            staffName: staff.name || 'Unknown',
            activeComplaints,
            totalComplaints: staffComplaints.length,
            resolvedComplaints,
            performanceScore: staff.performance_score || 50,
            primaryAreas: primaryAreaNames,
            allAreas: allAreaNames,
            score: 0, // will be computed per assignment
        };
    });
};

/**
 * Find the best staff member for a given complaint
 * Algorithm: Area match (50%) + Workload (30%) + Performance (20%)
 */
export const findBestStaff = (
    complaint: Complaint,
    staffMembers: User[],
    complaints: Complaint[],
    staffAreas: StaffArea[],
    areas: Area[]
): { staffId: string; reason: string; score: number } | null => {
    const activeStaff = staffMembers.filter(s => s.role === 'staff' && s.is_active !== false);
    if (activeStaff.length === 0) return null;

    const workloads = calculateStaffWorkloads(activeStaff, complaints, staffAreas, areas);
    const maxWorkload = Math.max(...workloads.map(w => w.activeComplaints), 1);

    const scoredStaff = workloads.map(w => {
        let areaScore = 0;
        const staffAreaMappings = staffAreas.filter(sa => sa.staff_id === w.staffId);
        const isPrimaryArea = staffAreaMappings.some(sa => sa.area_id === complaint.area_id && sa.is_primary);
        const isSecondaryArea = staffAreaMappings.some(sa => sa.area_id === complaint.area_id);

        if (isPrimaryArea) areaScore = 100;
        else if (isSecondaryArea) areaScore = 70;
        else areaScore = 20; // No area match

        // Lower workload = better (invert the score)
        const workloadScore = 100 - ((w.activeComplaints / maxWorkload) * 100);

        // Performance score (already 0-100)
        const performanceScore = w.performanceScore;

        // Weighted final score
        const finalScore = (areaScore * 0.50) + (workloadScore * 0.30) + (performanceScore * 0.20);

        const reasons: string[] = [];
        if (isPrimaryArea) reasons.push('Primary area match');
        else if (isSecondaryArea) reasons.push('Secondary area match');
        reasons.push(`Workload: ${w.activeComplaints} active`);
        reasons.push(`Performance: ${performanceScore}%`);

        return {
            staffId: w.staffId,
            staffName: w.staffName,
            score: finalScore,
            reason: reasons.join(' | '),
        };
    });

    // Sort by highest score
    scoredStaff.sort((a, b) => b.score - a.score);

    const best = scoredStaff[0];
    if (!best) return null;

    return {
        staffId: best.staffId,
        reason: `Auto-assigned to ${best.staffName}: ${best.reason}`,
        score: best.score,
    };
};

/**
 * Get staff assignment recommendations for all unassigned complaints
 */
export const getAssignmentRecommendations = (
    complaints: Complaint[],
    staffMembers: User[],
    staffAreas: StaffArea[],
    areas: Area[]
): { complaintId: string; recommendation: ReturnType<typeof findBestStaff> }[] => {
    const unassigned = complaints.filter(c => !c.assignedStaffId && c.status !== 'Completed');

    return unassigned.map(c => ({
        complaintId: c.id,
        recommendation: findBestStaff(c, staffMembers, complaints, staffAreas, areas),
    }));
};
