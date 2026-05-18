/**
 * ANALYTICS ENGINE — Advanced insights
 */
import type { Complaint, Rating } from '../context/mockData';

export const getAvgResolutionTime = (complaints: Complaint[]): number => {
    const resolved = complaints.filter(c => c.status === 'Completed' && c.resolved_at);
    if (!resolved.length) return 0;
    const totalHours = resolved.reduce((sum, c) => {
        const submitted = new Date(c.dateSubmitted).getTime();
        const resolvedAt = new Date(c.resolved_at!).getTime();
        return sum + (resolvedAt - submitted) / 3600000;
    }, 0);
    return Math.round(totalHours / resolved.length);
};

export const getComplaintGrowthRate = (complaints: Complaint[]): number => {
    const now = Date.now();
    const thisWeek = complaints.filter(c => now - new Date(c.dateSubmitted).getTime() < 7 * 86400000).length;
    const lastWeek = complaints.filter(c => {
        const age = now - new Date(c.dateSubmitted).getTime();
        return age >= 7 * 86400000 && age < 14 * 86400000;
    }).length;
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
};

export const getPeakHours = (complaints: Complaint[]): { hour: number; count: number }[] => {
    const hourCounts: Record<number, number> = {};
    complaints.forEach(c => {
        const hour = new Date(c.dateSubmitted).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    return Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hourCounts[i] || 0 }));
};

export const getAreaRanking = (complaints: Complaint[]): { area: string; count: number; resolved: number; avgTime: number }[] => {
    const areaMap: Record<string, { count: number; resolved: number; totalTime: number }> = {};
    complaints.forEach(c => {
        const area = c.location?.split(',')[0]?.trim() || 'Unknown';
        if (!areaMap[area]) areaMap[area] = { count: 0, resolved: 0, totalTime: 0 };
        areaMap[area].count++;
        if (c.status === 'Completed' && c.resolved_at) {
            areaMap[area].resolved++;
            areaMap[area].totalTime += (new Date(c.resolved_at).getTime() - new Date(c.dateSubmitted).getTime()) / 3600000;
        }
    });
    return Object.entries(areaMap)
        .map(([area, d]) => ({ area, count: d.count, resolved: d.resolved, avgTime: d.resolved ? Math.round(d.totalTime / d.resolved) : 0 }))
        .sort((a, b) => b.count - a.count);
};

export const getSLAComplianceRate = (complaints: Complaint[]): number => {
    const withSLA = complaints.filter(c => c.sla_deadline && c.status === 'Completed');
    if (!withSLA.length) return 100;
    const onTime = withSLA.filter(c => {
        const resolved = c.resolved_at ? new Date(c.resolved_at).getTime() : Date.now();
        return resolved <= new Date(c.sla_deadline!).getTime();
    }).length;
    return Math.round((onTime / withSLA.length) * 100);
};

export const getStaffPerformanceRanking = (
    staffIds: string[],
    complaints: Complaint[],
    ratings: Rating[]
): { staffId: string; resolved: number; avgRating: number; avgTime: number; score: number }[] => {
    return staffIds.map(staffId => {
        const staffComplaints = complaints.filter(c => c.assignedStaffId === staffId);
        const resolved = staffComplaints.filter(c => c.status === 'Completed');
        const staffRatings = ratings.filter(r => staffComplaints.some(c => c.id === r.complaint_id));
        const avgRating = staffRatings.length ? staffRatings.reduce((a, r) => a + r.rating, 0) / staffRatings.length : 0;
        const totalTime = resolved.reduce((sum, c) => {
            if (c.resolved_at) return sum + (new Date(c.resolved_at).getTime() - new Date(c.dateSubmitted).getTime()) / 3600000;
            return sum;
        }, 0);
        const avgTime = resolved.length ? Math.round(totalTime / resolved.length) : 0;
        const score = Math.round((avgRating * 20) + (resolved.length * 5) - (avgTime * 0.5));
        return { staffId, resolved: resolved.length, avgRating: Math.round(avgRating * 10) / 10, avgTime, score };
    }).sort((a, b) => b.score - a.score);
};
