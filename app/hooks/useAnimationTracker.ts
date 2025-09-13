import { useRef, useCallback } from "react";

export const useAnimationTracker = () => {
  const playedAnimations = useRef<Set<string>>(new Set());

  const shouldPlayAnimation = useCallback((key: string): boolean => {
    if (playedAnimations.current.has(key)) {
      return false;
    }
    playedAnimations.current.add(key);
    return true;
  }, []);

  const resetAnimations = useCallback(() => {
    playedAnimations.current.clear();
  }, []);

  return {
    shouldPlayAnimation,
    resetAnimations,
  };
};
