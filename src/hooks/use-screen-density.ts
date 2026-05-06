import { fontSizes, spacing } from "@/constants/theme";
import { useMemo } from "react";
import { ViewStyle, useWindowDimensions } from "react-native";

export type ScreenDensity = "compact" | "regular" | "tall";

export function useScreenDensity() {
  const { height, width } = useWindowDimensions();

  return useMemo(() => {
    const density: ScreenDensity =
      height < 760 ? "compact" : height < 900 ? "regular" : "tall";

    const isCompact = density === "compact";
    const isTall = density === "tall";

    return {
      density,
      height,
      width,
      isCompact,
      isTall,
      fixedScreen: {
        contentGap: isCompact ? spacing.md : spacing.lg,
        headerGap: isCompact ? spacing.lg : spacing.xl,
        headerTitleSize: isCompact ? fontSizes.xl : fontSizes.xxl,
        headerSubtitleSize: isCompact ? fontSizes.sm : fontSizes.md,
        heroSize: isCompact ? 220 : isTall ? 300 : 260,
        heroIconSize: isCompact ? 34 : isTall ? 42 : 38,
        heroBottomReserve: isCompact ? 250 : isTall ? 350 : 300,
        pillClearance: isCompact ? 88 : 112,
        resultGap: isCompact ? spacing.xs : spacing.sm,
        resultTopPadding: isCompact ? spacing.md : spacing.xl,
        statusGap: isCompact ? 2 : spacing.xs,
        bottomToastOffset: isCompact ? spacing.xxxl : spacing.xxl,
        tabBarClearance: isCompact ? 148 : 128,
      },
      entryScreen: {
        cardGap: isCompact ? spacing.sm : spacing.md,
        cardMinHeight: isCompact ? 128 : 148,
        cardPadding: isCompact ? spacing.md : spacing.lg,
        contentGap: isCompact ? spacing.lg : spacing.xl,
        justifyContent: (isCompact ? "flex-start" : "center") as ViewStyle["justifyContent"],
        topPadding: isCompact ? spacing.xl : 0,
      },
    };
  }, [height, width]);
}
