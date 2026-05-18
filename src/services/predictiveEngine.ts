/**
 * PREDICTIVE ENGINE — Simple trend analysis for complaint prediction
 */
import type { Complaint } from '../context/mockData';

export interface PredictionResult {
    area: string;
    dayOfWeek: string;
    predictedCount: number;
    confidence: number;
    trend: 'rising' | 'falling' | 'stable';
    insight: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getPredictions = (complaints: Complaint[]): PredictionResult[] => {
    // Group by area + day of week
    const areaDay: Record<string, Record<number, number[]>> = {};

    complaints.forEach(c => {
        const area = c.location?.split(',')[0]?.trim() || 'Unknown';
        const day = new Date(c.dateSubmitted).getDay();
        const weekNum = Math.floor((Date.now() - new Date(c.dateSubmitted).getTime()) / (7 * 86400000));

        if (!areaDay[area]) areaDay[area] = {};
        if (!areaDay[area][day]) areaDay[area][day] = [];
        areaDay[area][day].push(weekNum);
    });

    const results: PredictionResult[] = [];

    Object.entries(areaDay).forEach(([area, days]) => {
        Object.entries(days).forEach(([dayStr, weeks]) => {
            const day = parseInt(dayStr);
            const count = weeks.length;
            if (count < 2) return;

            const recentWeeks = weeks.filter(w => w <= 2).length;
            const olderWeeks = weeks.filter(w => w > 2).length;
            const trend = recentWeeks > olderWeeks ? 'rising' : recentWeeks < olderWeeks ? 'falling' : 'stable';
            const predictedCount = Math.ceil(count * (trend === 'rising' ? 1.2 : trend === 'falling' ? 0.8 : 1));
            const confidence = Math.min(95, 40 + count * 10);

            let insight = `${area} typically sees ${count} complaint(s) on ${DAYS[day]}s.`;
            if (trend === 'rising') insight += ' ⬆️ Trend increasing — consider pre-deploying staff.';
            else if (trend === 'falling') insight += ' ⬇️ Trend decreasing.';

            results.push({ area, dayOfWeek: DAYS[day], predictedCount, confidence, trend, insight });
        });
    });

    return results.sort((a, b) => b.predictedCount - a.predictedCount).slice(0, 10);
};

export const getNextSpikePrediction = (complaints: Complaint[]): { day: string; area: string; count: number } | null => {
    const predictions = getPredictions(complaints);
    const today = new Date().getDay();
    const upcoming = predictions.filter(p => DAYS.indexOf(p.dayOfWeek) > today || (DAYS.indexOf(p.dayOfWeek) === today));
    const rising = upcoming.filter(p => p.trend === 'rising');
    if (rising.length > 0) return { day: rising[0].dayOfWeek, area: rising[0].area, count: rising[0].predictedCount };
    return predictions.length > 0 ? { day: predictions[0].dayOfWeek, area: predictions[0].area, count: predictions[0].predictedCount } : null;
};
