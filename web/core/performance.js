// Shared semantic event layer for instrument profiles and output adapters.
export function createPerformanceBus() {
  const listeners = new Set();
  return {
    on(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    emit(event) { listeners.forEach(listener => listener(event)); }
  };
}
