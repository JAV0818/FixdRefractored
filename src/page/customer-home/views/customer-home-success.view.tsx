import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { AppButton, AppCard } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { categoriesByGroup, type ServiceCategory } from "@/constants/service-categories";
import { useAuthContext } from "@/providers/auth-provider";
import type { UserProfile } from "@/types/user.interface";

import { CUSTOMER_HOME_COPY } from "../customer-home.constants";
import { EmergencyBanner, SectionHeader, ServiceCategoryCard } from "../components";

type CustomerHomeSuccessViewProps = {
  profile: UserProfile | null;
};

const QUOTE_REQUEST_ROUTE = "/(customer-tabs)/services/quote-request" as const;

const MAINTENANCE = categoriesByGroup("maintenance");
const EMERGENCY = categoriesByGroup("emergency");

export const CustomerHomeSuccessView = ({ profile }: CustomerHomeSuccessViewProps) => {
  const router = useRouter();
  const { currentUser } = useAuthContext();
  // firstName from the profile doc, else the auth display name, else a generic.
  const name = profile?.firstName?.trim() || currentUser?.displayName?.trim() || "there";

  const openQuoteRequest = useCallback(() => {
    router.push(QUOTE_REQUEST_ROUTE);
  }, [router]);

  const openWithCategory = useCallback(
    (category: ServiceCategory) => {
      router.push({
        pathname: QUOTE_REQUEST_ROUTE,
        params: { category: category.id },
      });
    },
    [router],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{CUSTOMER_HOME_COPY.greeting(name)}</Text>
        <Text style={styles.subtitle}>{CUSTOMER_HOME_COPY.subtitle}</Text>
      </View>

      <EmergencyBanner
        title={CUSTOMER_HOME_COPY.emergency.title}
        subtitle={CUSTOMER_HOME_COPY.emergency.subtitle}
        onPress={openQuoteRequest}
      />

      <CategoryRow
        title={CUSTOMER_HOME_COPY.sections.maintenance}
        items={MAINTENANCE}
        onPress={openWithCategory}
      />

      <CategoryRow
        title={CUSTOMER_HOME_COPY.sections.emergency}
        items={EMERGENCY}
        onPress={openWithCategory}
      />

      <AppCard>
        <Text style={styles.ctaTitle}>{CUSTOMER_HOME_COPY.ctaTitle}</Text>
        <Text style={styles.ctaSubtitle}>{CUSTOMER_HOME_COPY.ctaSubtitle}</Text>
        <AppButton onPress={openQuoteRequest}>{CUSTOMER_HOME_COPY.ctaButton}</AppButton>
      </AppCard>
    </ScrollView>
  );
};

type CategoryRowProps = {
  title: string;
  items: ServiceCategory[];
  onPress: (category: ServiceCategory) => void;
};

const CategoryRow = ({ title, items, onPress }: CategoryRowProps) => (
  <View style={styles.section}>
    <SectionHeader title={title} />
    {/* Full-bleed to the screen edge so the next card peeks → "swipe me". */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.categoryRow}
    >
      {items.map((category) => (
        <ServiceCategoryCard key={category.id} category={category} onPress={onPress} />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  header: {
    gap: spacing.xs,
  },
  greeting: {
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  // Cancel the page's horizontal padding so the row spans edge-to-edge…
  row: {
    marginHorizontal: -spacing.lg,
  },
  // …and re-inset the cards so the first aligns with the rest of the page,
  // leaving the last card to peek past the right edge.
  categoryRow: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  ctaTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  ctaSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
