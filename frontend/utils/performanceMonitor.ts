// A simple utility to measure and report component performance

let isEnabled = __DEV__;

// Toggle monitoring on/off
export const setPerformanceMonitoring = (enabled: boolean) => {
  isEnabled = enabled;
};

// Measure time elapsed
export const measurePerformance = (componentName: string, operation: string, callback: () => void) => {
  if (!isEnabled) {
    callback();
    return;
  }

  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  
  console.log(`[Performance] ${componentName} - ${operation}: ${(endTime - startTime).toFixed(2)}ms`);
};

// Monitor load time
export const useComponentLoadTime = (componentName: string) => {
  if (!isEnabled) return;
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`[Performance] ${componentName} mounted in: ${(endTime - startTime).toFixed(2)}ms`);
  };
};

// Log when a heavy calculation is performed
export const logCalculation = (name: string, inputs?: any) => {
  if (!isEnabled) return;
  
  console.log(`[Performance] Calculating ${name}`, inputs ? { inputs } : '');
};