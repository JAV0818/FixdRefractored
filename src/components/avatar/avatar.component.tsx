// Avatar — a round profile image, or a colored circle with the person's
// initials when there's no photo. App-wide primitive.

import { memo } from "react";
import { StyleSheet, Image, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontWeight } from "@/theme";

type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
};

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar = memo(function Avatar({ name, photoUrl, size = 48 }: AvatarProps) {
  const dimensions = { width: size, height: size, borderRadius: size / 2 };

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={[styles.image, dimensions]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.fallback, dimensions]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initialsOf(name)}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceVariant,
  },
  fallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.onPrimary,
    fontWeight: fontWeight.bold,
  },
});
