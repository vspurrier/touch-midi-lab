// Shared semantic event layer for instrument profiles and output adapters.
export type PerformanceEvent = { type: string; detail?: string };
export type PerformanceListener = (event: PerformanceEvent) => void;

export function createPerformanceBus() {
  const listeners = new Set<PerformanceListener>();
  return {
    on(listener: PerformanceListener) { listeners.add(listener); return () => listeners.delete(listener); },
    emit(event: PerformanceEvent) { listeners.forEach(listener => listener(event)); }
  };
}
