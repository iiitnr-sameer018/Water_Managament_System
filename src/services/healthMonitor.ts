/**
 * SYSTEM HEALTH MONITOR — Tracks API response times, errors, and DB performance
 */

export interface HealthMetric {
    timestamp: number;
    metric: string;
    value: number;
    unit: string;
}

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    dbLatency: number;
    metrics: HealthMetric[];
}

const metricsStore: HealthMetric[] = [];
const startTime = Date.now();
let errorCount = 0;
let requestCount = 0;

export const recordMetric = (metric: string, value: number, unit: string = 'ms') => {
    metricsStore.push({ timestamp: Date.now(), metric, value, unit });
    if (metricsStore.length > 500) metricsStore.shift();
};

export const recordRequest = (responseTimeMs: number, isError = false) => {
    requestCount++;
    if (isError) errorCount++;
    recordMetric('response_time', responseTimeMs, 'ms');
};

export const measureAsync = async <T>(fn: () => Promise<T>, label: string): Promise<T> => {
    const start = performance.now();
    try {
        const result = await fn();
        recordRequest(performance.now() - start);
        return result;
    } catch (e) {
        recordRequest(performance.now() - start, true);
        throw e;
    }
};

export const getSystemHealth = (): SystemHealth => {
    const recent = metricsStore.filter(m => m.metric === 'response_time' && Date.now() - m.timestamp < 300000);
    const avgResponseTime = recent.length ? Math.round(recent.reduce((a, m) => a + m.value, 0) / recent.length) : 0;
    const errorRate = requestCount ? Math.round((errorCount / requestCount) * 100) : 0;
    const dbMetrics = metricsStore.filter(m => m.metric === 'db_latency' && Date.now() - m.timestamp < 300000);
    const dbLatency = dbMetrics.length ? Math.round(dbMetrics.reduce((a, m) => a + m.value, 0) / dbMetrics.length) : 0;

    let status: SystemHealth['status'] = 'healthy';
    if (errorRate > 10 || avgResponseTime > 2000) status = 'degraded';
    if (errorRate > 50 || avgResponseTime > 5000) status = 'down';

    return {
        status, uptime: Date.now() - startTime, avgResponseTime, errorRate, dbLatency,
        metrics: metricsStore.slice(-50)
    };
};
