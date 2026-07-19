import { memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { colors, radii, spacing, shadows } from "@/theme";
import {
  FLOATING_TAB_HEIGHT,
  FLOATING_TAB_MARGIN,
  FLOATING_TAB_CENTER_BUTTON_SIZE,
  FLOATING_TAB_CENTER_BUTTON_PROTRUSION,
} from "@/constants/layout";

const SIDE_ICON_SIZE = 22;
const CENTER_ICON_SIZE = 28;

export const FloatingTabBar = memo(function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const centerIndex = Math.floor(state.routes.length / 2);

  const leftRoutes = state.routes.slice(0, centerIndex);
  const centerRoute = state.routes[centerIndex];
  const rightRoutes = state.routes.slice(centerIndex + 1);

  const renderRoute = (route: typeof centerRoute, index: number, isCenter: boolean) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const color = isCenter ? colors.onPrimary : isFocused ? colors.primary : colors.textSecondary;
    const label = (options.tabBarLabel ?? options.title ?? route.name) as string;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={isCenter ? styles.centerTab : styles.tab}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
      >
        {isCenter ? (
          <View style={styles.centerButton}>
            {options.tabBarIcon?.({ focused: isFocused, color, size: CENTER_ICON_SIZE })}
          </View>
        ) : (
          options.tabBarIcon?.({ focused: isFocused, color, size: SIDE_ICON_SIZE })
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.pill, { bottom: insets.bottom + spacing["3"] }]}>
      <View style={styles.sideGroup}>
        {leftRoutes.map((route, index) => renderRoute(route, index, false))}
      </View>
      {renderRoute(centerRoute, centerIndex, true)}
      <View style={styles.sideGroup}>
        {rightRoutes.map((route, index) =>
          renderRoute(route, centerIndex + 1 + index, false)
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    left: FLOATING_TAB_MARGIN,
    right: FLOATING_TAB_MARGIN,
    height: FLOATING_TAB_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radii["2xl"],
    ...shadows.lg,
    shadowColor: colors.shadow,
  },
  sideGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTab: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: FLOATING_TAB_CENTER_BUTTON_SIZE,
    height: FLOATING_TAB_CENTER_BUTTON_SIZE,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -FLOATING_TAB_CENTER_BUTTON_PROTRUSION,
    ...shadows.md,
    shadowColor: colors.shadow,
  },
});
