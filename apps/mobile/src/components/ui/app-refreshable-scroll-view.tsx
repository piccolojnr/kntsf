import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";
import { PropsWithChildren, useRef, useState } from "react";

import { colors, spacing } from "@/constants/theme";

type AppRefreshableScrollViewProps = PropsWithChildren<
  Omit<ScrollViewProps, "refreshControl"> & {
    onRefresh: () => void;
    refreshing: boolean;
  }
>;

const REFRESH_DISTANCE = 72;

export function AppRefreshableScrollView({
  children,
  onRefresh,
  onScroll,
  onTouchEnd,
  onTouchMove,
  onTouchStart,
  refreshing,
  scrollEventThrottle,
  style,
  ...props
}: AppRefreshableScrollViewProps) {
  const scrollYRef = useRef(0);
  const startYRef = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  }

  return (
    <View style={[styles.container, style]}>
      {(refreshing || pullDistance > 12) && (
        <View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              opacity: refreshing ? 1 : Math.min(pullDistance / REFRESH_DISTANCE, 1),
              transform: [
                {
                  translateY: refreshing
                    ? 0
                    : Math.min(pullDistance / 2, spacing.xl),
                },
              ],
            },
          ]}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      <ScrollView
        {...props}
        style={styles.scrollView}
        onScroll={handleScroll}
        onTouchStart={(event) => {
          startYRef.current =
            scrollYRef.current <= 0 ? event.nativeEvent.pageY : null;
          onTouchStart?.(event);
        }}
        onTouchMove={(event) => {
          if (startYRef.current !== null && !refreshing) {
            setPullDistance(
              Math.max(0, event.nativeEvent.pageY - startYRef.current),
            );
          }
          onTouchMove?.(event);
        }}
        onTouchEnd={(event) => {
          if (
            startYRef.current !== null &&
            pullDistance >= REFRESH_DISTANCE &&
            !refreshing
          ) {
            onRefresh();
          }
          startYRef.current = null;
          setPullDistance(0);
          onTouchEnd?.(event);
        }}
        scrollEventThrottle={scrollEventThrottle ?? 16}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  indicator: {
    alignItems: "center",
    height: spacing.xl,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: spacing.sm,
    zIndex: 1,
  },
});
