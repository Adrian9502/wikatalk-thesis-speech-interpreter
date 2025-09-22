import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (isActive && currentStep?.target === id) {
      console.log(`[TutorialTarget] Measuring target: ${id}`);

      // Multiple measurement attempts for better accuracy
      const measureTarget = () => {
        viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
          console.log(`[TutorialTarget] Measurement for ${id}:`, {
            x: pageX,
            y: pageY,
            width,
            height,
          });

          // Only register if we have valid measurements
          if (width > 0 && height > 0) {
            registerTarget(id, {
              x: pageX,
              y: pageY,
              width,
              height,
            });
          } else {
            // Retry measurement after a short delay
            setTimeout(measureTarget, 50);
          }
        });
      };

      // Try measuring immediately, then with delays
      measureTarget();
      const timer1 = setTimeout(measureTarget, 100);
      const timer2 = setTimeout(measureTarget, 250);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isActive, currentStep, id, registerTarget]);

  // FIXED: Determine if this is a flex child that needs flex: 1
  const isFlexChild =
    id.includes("text-area") ||
    id.includes("source-area") ||
    id.includes("target-area");

  const wrapperStyle: ViewStyle = {
    // IMPORTANT: For text areas, inherit flex behavior to maintain layout
    ...(isFlexChild && { flex: 1 }),
    ...style,
  };

  return (
    <View
      ref={viewRef}
      style={wrapperStyle}
      collapsable={false} // Prevent Android from optimizing away the view
    >
      {children}
    </View>
  );
};
