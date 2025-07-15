import { useEffect, useRef } from "react";

export function useRenderTracker(name: string = "Component") {
  // Only track in development
  if (__DEV__) {
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

    // Throttled render count logging (only log every 1000ms)
    useEffect(() => {
      const timer = setTimeout(() => {
        console.log(
          `[Render Count] ${name} rendered ${renderCount.current} times`
        );
      }, 1000);

      return () => clearTimeout(timer);
    });
  }
}
