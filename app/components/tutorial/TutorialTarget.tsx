import React, { useRef, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { useTutorial } from "@/context/TutorialContext";

interface TutorialTargetProps {
  id: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const TutorialTarget: React.FC<TutorialTargetProps> = ({
  id,
  children,
  style,
}) => {
  const { registerTarget, isActive, currentStep } = useTutorial();
  const viewRef = useRef<View>(null);
  const [measurementAttempts, setMeasurementAttempts] = useState(0);
  const [hasMeasured, setHasMeasured] = useState(false);
  const [isCurrentTarget, setIsCurrentTarget] = useState(false);
  const maxAttempts = 5; // REDUCED: Lower max attempts
  const measurementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ENHANCED: Better target tracking
  useEffect(() => {
    const isTargetActive = isActive && currentStep?.target === id;
    setIsCurrentTarget(isTargetActive);

    // CRITICAL: Reset measurement state when this becomes the active target
    if (isTargetActive && !hasMeasured) {
      setMeasurementAttempts(0);
    }

    // CRITICAL: Clean up when no longer the target
    if (!isTargetActive) {
      setMeasurementAttempts(0);
      setHasMeasured(false);
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current);
        measurementTimeoutRef.current = null;
      }
    }
  }, [isActive, currentStep?.target, id, hasMeasured]);

  // FIXED: Only measure when this is the current active target
  useEffect(() => {
    if (!isCurrentTarget || hasMeasured || measurementAttempts >= maxAttempts) {
      return;
    }

    console.log(
      `[TutorialTarget] Measuring target: ${id} (attempt ${
        measurementAttempts + 1
      })`
    );

    const measureTarget = () => {
      // DEFENSIVE: Double-check we're still the active target
      if (!isCurrentTarget || hasMeasured) {
        return;
      }

      viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
        // DEFENSIVE: Check again in case state changed during async operation
        if (!isCurrentTarget || hasMeasured) {
          return;
        }

        console.log(
          `[TutorialTarget] Measurement attempt ${
            measurementAttempts + 1
          } for ${id}:`,
          { x: pageX, y: pageY, width, height }
        );

        // Only register if we have valid measurements
        if (width > 0 && height > 0) {
          registerTarget(id, {
            x: pageX,
            y: pageY,
            width,
            height,
          });
          setHasMeasured(true);
          console.log(`[TutorialTarget] Successfully measured ${id}`);
        } else if (measurementAttempts < maxAttempts - 1) {
          // ENHANCED: Increment attempts and schedule retry
          setMeasurementAttempts((prev) => prev + 1);
          measurementTimeoutRef.current = setTimeout(() => {
            measureTarget();
          }, 200 * (measurementAttempts + 1)); // Progressive delay
        } else {
          console.log(
            `[TutorialTarget] Max attempts reached for ${id}, stopping measurement`
          );
        }
      });
    };

    // ENHANCED: Use setTimeout to avoid blocking the UI thread
    measurementTimeoutRef.current = setTimeout(measureTarget, 100);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current);
        measurementTimeoutRef.current = null;
      }
    };
  }, [isCurrentTarget, measurementAttempts, hasMeasured, id, registerTarget]);

  // ENHANCED: Cleanup on unmount
  useEffect(() => {
    return () => {
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current);
      }
    };
  }, []);

  const needsFlexLayout =
    id.includes("text-area") ||
    id.includes("source-area") ||
    id.includes("target-area") ||
    id.includes("translation-section") ||
    id.includes("scan-translation") ||
    id.includes("games-modes") ||
    id.includes("pronounce-pronunciation-card");

  const wrapperStyle: ViewStyle = {
    ...(needsFlexLayout && { flex: 1 }),
    ...style,
  };

  return (
    <View ref={viewRef} style={wrapperStyle} collapsable={false}>
      {children}
    </View>
  );
};
