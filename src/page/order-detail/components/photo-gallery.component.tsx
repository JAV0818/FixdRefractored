// PhotoGallery — order photo thumbnails that open a full-screen, swipeable
// viewer on tap. Local UI state only (which photo is open); no data or services.

import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, spacing } from "@/theme";
import type { Photo } from "@/types/photo.interface";

type PhotoGalleryProps = {
  photos: Photo[];
};

export const PhotoGallery = ({ photos }: PhotoGalleryProps) => {
  const { width, height } = useWindowDimensions();
  // Read insets here, outside the Modal. A SafeAreaView *inside* a Modal measures
  // zero insets the first time it opens (the close button then sits under the
  // status bar), then is correct on every open after.
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;
  const close = () => setActiveIndex(null);

  return (
    <>
      <View style={styles.grid}>
        {photos.map((photo, index) => (
          <TouchableOpacity key={photo.url} activeOpacity={0.85} onPress={() => setActiveIndex(index)}>
            <Image
              source={{ uri: photo.thumbUrl }}
              style={styles.thumb}
              contentFit="cover"
              transition={150}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
        <View style={styles.backdrop}>
          {isOpen && (
            <FlatList
              data={photos}
              keyExtractor={(photo) => photo.url}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={activeIndex ?? 0}
              // Decode only the open photo and its neighbours, not all 12 at once.
              initialNumToRender={1}
              windowSize={3}
              getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item }) => (
                // Tap the photo (not a swipe) to dismiss.
                <Pressable onPress={close} style={{ width, height }}>
                  <Image
                    source={{ uri: item.url }}
                    // Show the already-cached thumbnail instantly while the full photo loads.
                    placeholder={{ uri: item.thumbUrl }}
                    style={{ width, height }}
                    contentFit="contain"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                </Pressable>
              )}
            />
          )}
          <View style={[styles.closeBar, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
            <TouchableOpacity onPress={close} hitSlop={12} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.glassText} />
            </TouchableOpacity>
          </View>
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
    paddingRight: spacing.md,
  },
  // Frosted round button so the X stays visible over any photo, light or dark.
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glassSurfaceHighlight,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
  },
});
