import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/constants/theme";

type RadarPulseProps = {
  /** Whether the pulse animation is active */
  active?: boolean;
  /** Size of the entire radar zone */
  size?: number;
  /** Number of concentric rings */
  ringCount?: number;
  /** Color of the rings */
  color?: string;
  /** Pulse speed in milliseconds */
  duration?: number;
  /** Ring opacity multiplier */
  intensity?: number;
  /** Content to render at the center */
  children?: React.ReactNode;
};

function PulseRing({
  index,
  ringCount,
  size,
  color,
  duration,
  intensity,
  active,
}: {
  index: number;
  ringCount: number;
  size: number;
  color: string;
  duration: number;
  intensity: number;
  active: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = 0;
      progress.value = withDelay(
        index * (duration / ringCount),
        withRepeat(
          withTiming(1, {
            duration,
            easing: Easing.out(Easing.cubic),
          }),
          -1,
          false,
        ),
      );
    } else {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 600 });
    }

    return () => cancelAnimation(progress);
  }, [active, duration, index, ringCount, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.4, 1]);
    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.8, 1],
      [0, 0.6 * intensity, 0.3 * intensity, 0],
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function RadarPulse({
  active = true,
  size = 260,
  ringCount = 3,
  color = colors.primary,
  duration = 2400,
  intensity = 1,
  children,
}: RadarPulseProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Static base ring (always visible) */}
      <View
        style={[
          styles.baseRing,
          {
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: (size * 0.5) / 2,
            borderColor: active ? color : colors.border,
          },
        ]}
      />

      {/* Animated pulse rings */}
      {Array.from({ length: ringCount }).map((_, i) => (
        <PulseRing
          key={i}
          index={i}
          ringCount={ringCount}
          size={size}
          color={color}
          duration={duration}
          intensity={intensity}
          active={active}
        />
      ))}

      {/* Center content */}
      <View
        style={[
          styles.center,
          {
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: (size * 0.45) / 2,
            backgroundColor: active ? color : colors.surfaceMuted,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    borderWidth: 2.5,
    position: "absolute",
  },
  baseRing: {
    borderWidth: 2,
    position: "absolute",
    opacity: 0.25,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
});
