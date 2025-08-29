// A simple utility to measure and report component performance

let isEnabled = __DEV__;
// NEW: Add throttling to reduce log spam
const loggedComponents = new Map<string, number>();
const LOG_THROTTLE_MS = 5000; // Only log same component once per 5 seconds

// Toggle monitoring on/off
export const setPerformanceMonitoring = (enabled: boolean) => {
  isEnabled = enabled;
};

// Measure time elapsed
export const measurePerformance = (
  componentName: string,
  operation: string,
  callback: () => void
) => {
  if (!isEnabled) {
    callback();
    return;
  }

  const startTime = performance.now();
  callback();
  const endTime = performance.now();

  console.log(
    `[Performance] ${componentName} - ${operation}: ${(
      endTime - startTime
    ).toFixed(2)}ms`
  );
};

// Monitor load time - FIXED: Add throttling
export const useComponentLoadTime = (componentName: string) => {
  if (!isEnabled) return;

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    // FIXED: Throttle performance logs to reduce spam
    const lastLogged = loggedComponents.get(componentName) || 0;
    const now = Date.now();

    if (now - lastLogged > LOG_THROTTLE_MS) {
      console.log(`[Performance] ${componentName} mounted in: ${duration}ms`);
      loggedComponents.set(componentName, now);
    }
  };
};

// Log when a heavy calculation is performed
export const logCalculation = (name: string, inputs?: any) => {
  if (!isEnabled) return;

  console.log(`[Performance] Calculating ${name}`, inputs ? { inputs } : "");
};
