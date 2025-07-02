/**
 * Format seconds into a human-readable time string
 * @param seconds The time in seconds to format
 * @returns Formatted time string (e.g., "1h 30m 20s")
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (remainingSeconds === 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
};