// useImagePicker — shared wrapper around expo-image-picker. Returns a `pick`
// function that asks for permission, opens the library, and resolves the chosen
// local URIs (empty array on cancel/denied). The caller owns merging/capping.

import { useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export const useImagePicker = () =>
  useCallback(async (remaining: number): Promise<string[]> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow photo library access to attach pictures.");
      return [];
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(remaining, 1),
      quality: 0.7,
    });
    if (result.canceled) return [];
    return result.assets.map((asset) => asset.uri);
  }, []);
