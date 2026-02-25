/**
 * Metrics Collection Module
 * Tracks request duration, error rates, and performance metrics
 */

interface RequestMetrics {
  duration: number;
  statusCode: number;
  timestamp: number;
}

class MetricsCollector {
  private requestMetrics: RequestMetrics[] = [];
  private errorCount = 0;
  private totalRequests = 0;
  private readonly maxMetrics = 10000; // Keep last 10000 requests
  private readonly metricsWindow = 300000; // 5 minutes in ms

  /**
   * Record a request
   */
  recordRequest(duration: number, statusCode: number): void {
    const now = Date.now();
    this.totalRequests++;

    if (statusCode >= 400) {
      this.errorCount++;
    }

    this.requestMetrics.push({
      duration,
      statusCode,
      timestamp: now,
    });

    // Clean up old metrics
    this.cleanup();
  }

  /**
   * Remove metrics older than the time window
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.metricsWindow;

    this.requestMetrics = this.requestMetrics.filter((m) => m.timestamp >= cutoff);

    // Also keep memory in check
    if (this.requestMetrics.length > this.maxMetrics) {
      this.requestMetrics = this.requestMetrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Calculate percentile from an array of values
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics() {
    const durations = this.requestMetrics.map((m) => m.duration);
    const recentRequests = this.requestMetrics.length;
    const recentErrors = this.requestMetrics.filter((m) => m.statusCode >= 400).length;

    return {
      totalRequests: this.totalRequests,
      errorCount: this.errorCount,
      recentRequests,
      recentErrors,
      avgResponseTime:
        recentRequests > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / recentRequests) : 0,
      p50ResponseTime: this.calculatePercentile(durations, 50),
      p95ResponseTime: this.calculatePercentile(durations, 95),
      p99ResponseTime: this.calculatePercentile(durations, 99),
    };
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.requestMetrics = [];
    this.errorCount = 0;
    this.totalRequests = 0;
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();

/**
 * Get metrics including SSE connections
 */
export function getMetrics() {
  const apiMetrics = metricsCollector.getMetrics();

  // Dynamic import to avoid circular dependency
  const sseConnections = 0;
  const sseSessions = 0;

  try {
    // We'll get SSE metrics through the broadcaster's public methods
    // These will be populated by the health check route
  } catch (_e) {
    // Ignore errors
  }

  return {
    ...apiMetrics,
    sseConnections,
    sseSessions,
  };
}

/**
 * Export metrics getter that includes SSE data
 */
export function setSSEMetrics(connections: number, sessions: number) {
  return {
    ...metricsCollector.getMetrics(),
    sseConnections: connections,
    sseSessions: sessions,
  };
}
