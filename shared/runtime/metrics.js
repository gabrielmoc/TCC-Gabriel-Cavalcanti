function createRuntimeMetrics(serviceName, buildExtras = () => ({})) {
  const startedAt = Date.now();
  const cpuStartedAt = process.cpuUsage();
  const state = {
    requestsTotal: 0,
    durationTotalMs: 0,
    durationMaxMs: 0,
    statusCounts: {},
    counters: {},
  };

  function incrementCounter(group, key) {
    const normalizedGroup = group || "default";
    const normalizedKey = String(key ?? "unknown");

    if (!state.counters[normalizedGroup]) {
      state.counters[normalizedGroup] = {};
    }

    state.counters[normalizedGroup][normalizedKey] =
      (state.counters[normalizedGroup][normalizedKey] || 0) + 1;
  }

  function recordRequest(statusCode, durationMs) {
    state.requestsTotal += 1;
    state.durationTotalMs += durationMs;
    state.durationMaxMs = Math.max(state.durationMaxMs, durationMs);
    state.statusCounts[statusCode] = (state.statusCounts[statusCode] || 0) + 1;
  }

  function snapshot() {
    const cpuUsage = process.cpuUsage(cpuStartedAt);
    const memoryUsage = process.memoryUsage();
    const averageDurationMs =
      state.requestsTotal > 0 ? state.durationTotalMs / state.requestsTotal : 0;

    return {
      service: serviceName,
      uptimeSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(3)),
      requests: {
        total: state.requestsTotal,
        averageDurationMs: Number(averageDurationMs.toFixed(3)),
        maxDurationMs: state.durationMaxMs,
        statusCounts: state.statusCounts,
      },
      resources: {
        cpuMicros: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          total: cpuUsage.user + cpuUsage.system,
        },
        memoryBytes: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers,
        },
      },
      counters: state.counters,
      extras: buildExtras(),
    };
  }

  return {
    incrementCounter,
    recordRequest,
    snapshot,
  };
}

module.exports = {
  createRuntimeMetrics,
};
