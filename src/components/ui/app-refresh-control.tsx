import { RefreshControl } from "react-native";

import { colors } from "@/constants/theme";

type AppRefreshControlProps = {
  onRefresh: () => void;
  refreshing: boolean;
};

export function AppRefreshControl({
  onRefresh,
  refreshing,
}: AppRefreshControlProps) {
  return (
    <RefreshControl
      colors={[colors.primary]}
      onRefresh={onRefresh}
      progressBackgroundColor={colors.surface}
      refreshing={refreshing}
      tintColor={colors.primary}
    />
  );
}
