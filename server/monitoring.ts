
export class PerformanceMonitor {
  private static readonly responseTimeThreshold = 200; // 200ms
  private static metrics: {
    totalRequests: number;
    totalResponseTime: number;
    errors: number;
  } = {
    totalRequests: 0,
    totalResponseTime: 0,
    errors: 0
  };

  static recordResponse(duration: number): void {
    this.metrics.totalRequests++;
    this.metrics.totalResponseTime += duration;

    if (duration > this.responseTimeThreshold) {
      console.warn(`Slow response detected: ${duration}ms`);
    }
  }

  static recordError(): void {
    this.metrics.errors++;
  }

  static getMetrics() {
    return {
      ...this.metrics,
      averageResponseTime: this.metrics.totalResponseTime / this.metrics.totalRequests,
      errorRate: (this.metrics.errors / this.metrics.totalRequests) * 100
    };
  }
}
