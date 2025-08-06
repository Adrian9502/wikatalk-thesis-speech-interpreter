import { useCallback } from "react";
import { Animated } from "react-native";

export const useLevelInfoModalAnimations = (
  overlayOpacity: Animated.Value,
  confirmationOpacity: Animated.Value,
  confirmationScale: Animated.Value,
  resetMessageOpacity: Animated.Value,
  resetMessageScale: Animated.Value,
  showResetConfirmation: boolean,
  setShowResetConfirmation: (show: boolean) => void,
  setResetMessage: (message: any) => void
) => {
  const handleStart = useCallback(
    (
      onStart: () => void,
      isLoading: boolean,
      isAnimating: boolean,
      hasStarted: boolean,
      setHasStarted: (started: boolean) => void
    ) => {
      if (isLoading || isAnimating || hasStarted) return;

      console.log("[LevelInfoModal] Starting level...");
      setHasStarted(true);

      const closeAndNavigate = () => {
        try {
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(() => {
              onStart();
            }, 50);
          });
        } catch (error) {
          console.error("[LevelInfoModal] Navigation error:", error);
          setTimeout(() => {
            onStart();
          }, 300);
        }
      };

      closeAndNavigate();
    },
    [overlayOpacity]
  );

  const handleClose = useCallback(
    (
      onClose: () => void,
      isAnimating: boolean,
      setIsAnimating: (animating: boolean) => void
    ) => {
      if (isAnimating) return;

      setIsAnimating(true);

      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
        onClose();
      });
    },
    [overlayOpacity]
  );

  const handleShowResetConfirmation = useCallback(() => {
    setShowResetConfirmation(true);

    Animated.parallel([
      Animated.timing(confirmationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(confirmationScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [confirmationOpacity, confirmationScale, setShowResetConfirmation]);

  const handleHideResetConfirmation = useCallback(() => {
    Animated.parallel([
      Animated.timing(confirmationOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(confirmationScale, {
        toValue: 0.8,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowResetConfirmation(false);
    });
  }, [confirmationOpacity, confirmationScale, setShowResetConfirmation]);

  const showResetMessage = useCallback(
    (type: "success" | "error", title: string) => {
      console.log(`[LevelInfoModal] Showing reset message: ${type} - ${title}`);

      if (showResetConfirmation) {
        Animated.parallel([
          Animated.timing(confirmationOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(confirmationScale, {
            toValue: 0.8,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowResetConfirmation(false);
          setResetMessage({ type, title, description: "" });

          setTimeout(() => {
            Animated.parallel([
              Animated.timing(resetMessageOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(resetMessageScale, {
                toValue: 1,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
              }),
            ]).start(() => {
              console.log(`[LevelInfoModal] Reset message animation completed`);
            });
          }, 50);
        });
      } else {
        setResetMessage({ type, title, description: "" });

        setTimeout(() => {
          Animated.parallel([
            Animated.timing(resetMessageOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(resetMessageScale, {
              toValue: 1,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start(() => {
            console.log(`[LevelInfoModal] Reset message animation completed`);
          });
        }, 50);
      }

      setTimeout(() => {
        console.log(`[LevelInfoModal] Hiding reset message`);
        Animated.parallel([
          Animated.timing(resetMessageOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(resetMessageScale, {
            toValue: 0.8,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setResetMessage(null);
          console.log(`[LevelInfoModal] Reset message cleared`);
        });
      }, 2500);
    },
    [
      showResetConfirmation,
      confirmationOpacity,
      confirmationScale,
      resetMessageOpacity,
      resetMessageScale,
      setShowResetConfirmation,
      setResetMessage,
    ]
  );

  return {
    handleStart,
    handleClose,
    handleShowResetConfirmation,
    handleHideResetConfirmation,
    showResetMessage,
  };
};
