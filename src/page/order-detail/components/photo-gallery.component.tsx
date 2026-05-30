// PhotoGallery — order photo thumbnails that open a full-screen, swipeable
// viewer on tap. Local UI state only (which photo is open); no data or services.

import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radii, spacing } from "@/theme";

type PhotoGalleryProps = {
  uris: string[];
};

export const PhotoGallery = ({ uris }: PhotoGalleryProps) => {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;
  const close = () => setActiveIndex(null);

  return (
    <>
      <View style={styles.grid}>
        {uris.map((uri, index) => (
          <TouchableOpacity key={uri} activeOpacity={0.85} onPress={() => setActiveIndex(index)}>
            <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
        <View style={styles.backdrop}>
          {isOpen && (
            <FlatList
              data={uris}
              keyExtractor={(uri) => uri}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={activeIndex ?? 0}
              getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item }) => (
                // Tap the photo (not a swipe) to dismiss.
                <Pressable onPress={close} style={{ width, height }}>
                  <Image source={{ uri: item }} style={{ width, height }} resizeMode="contain" />
                </Pressable>
              )}
            />
          )}
          <SafeAreaView edges={["top"]} style={styles.closeBar} pointerEvents="box-none">
            <TouchableOpacity onPress={close} hitSlop={16} style={styles.closeButton}>
              <Ionicons name="close" size={40} color={colors.dangerOnDark} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceVariant,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
  },
  closeBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "flex-end",
  },
  closeButton: {
    padding: spacing.md,
  },
});
