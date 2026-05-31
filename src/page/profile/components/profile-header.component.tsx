// ProfileHeader — the avatar (tap to change photo) plus name and subtitle.
// Shows a camera badge, and a dim + spinner overlay while a new photo uploads.

import { memo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { Avatar } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

const AVATAR_SIZE = 96;

type ProfileHeaderProps = {
  name: string;
  subtitle: string;
  photoUrl: string | null;
  isUploading: boolean;
  onChangePhoto: () => void;
};

export const ProfileHeader = memo(function ProfileHeader({
  name,
  subtitle,
  photoUrl,
  isUploading,
  onChangePhoto,
}: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onChangePhoto}
        disabled={isUploading}
        style={styles.avatarWrap}
      >
        <Avatar name={name} photoUrl={photoUrl} size={AVATAR_SIZE} />
        {isUploading ? (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color={colors.onPrimary} />
          </View>
        ) : (
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color={colors.onPrimary} />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    gap: spacing.xs,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.overlayDark,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
