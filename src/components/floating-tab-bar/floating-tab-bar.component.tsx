import { memo } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors, radii, spacing, fontSize, fontWeight, shadows } from "@/theme";
import { FLOATING_TAB_HEIGHT, FLOATING_TAB_MARGIN } from "@/constants/layout";

export const FloatingTabBar = memo(function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.pill, { bottom: insets.bottom + spacing["3"] }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? colors.primary : colors.textSecondary;
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
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            {options.tabBarIcon?.({ focused: isFocused, color, size: 22 })}
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
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
    justifyContent: "space-around",
    backgroundColor: colors.surface,
    borderRadius: radii["2xl"],
    ...shadows.lg,
    shadowColor: colors.shadow,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
