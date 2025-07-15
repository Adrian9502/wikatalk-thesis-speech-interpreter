import { useEffect, useRef } from "react";

export function useRenderTracker(name: string = "Component") {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());
  const isFirstRender = useRef(true);

  renderCount.current++;

  // Only log mount time on first render
  useEffect(() => {
    if (isFirstRender.current) {
      const endTime = performance.now();
      const total = (endTime - mountTime.current).toFixed(2);
      console.log(`[Performance] ${name} mounted in: ${total}ms`);
      isFirstRender.current = false;
    }
  }, [name]);

  // Log render count (but not on every render to avoid spam)
  useEffect(() => {
    console.log(`[Render Count] ${name} rendered ${renderCount.current} times`);
  });
}
