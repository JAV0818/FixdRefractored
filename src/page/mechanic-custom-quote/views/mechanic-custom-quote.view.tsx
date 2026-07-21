// Mechanic custom-quote wizard. Two steps:
//   0 — search for the customer by name or phone
//   1 — build the quote (vehicle, description, categories, line items, time)
// On submit, creates a custom_quote order at QuoteProposed status so the
// customer immediately sees it in their Requests tab to approve or decline.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { HelperText, Text, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";

import { AppButton, AppTextInput, DateTimeField, FilterChips, KeyboardSafeView, MultilineTextInput } from "@/components";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { formatCurrency } from "@/utils/format";
import { useAuthContext } from "@/providers/auth-provider";
import { PLATFORM_DEPOSIT } from "@/services/order-service";
import type { OrderItem } from "@/types/order.interface";
import type { UserProfile } from "@/types/user.interface";

import {
  CUSTOM_QUOTE_CATEGORIES,
  MECHANIC_CUSTOM_QUOTE_COPY,
} from "../mechanic-custom-quote.constants";
import { CustomerResultCard, LineItemRow } from "../components";
import { useSearchCustomers } from "../hooks/use-search-customers";
import { useCreateCustomQuote } from "../hooks/use-create-custom-quote";

// ─── Line item helpers ────────────────────────────────────────────────────────

type LineItemDraft = { id: string; name: string; price: string; quantity: string };

const num = (value: string): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const qtyOf = (value: string): number => Math.max(1, Math.floor(num(value)) || 1);

// ─── View ─────────────────────────────────────────────────────────────────────

export const MechanicCustomQuoteView = () => {
  const router = useRouter();
  const { currentUser } = useAuthContext();
  const createCustomQuote = useCreateCustomQuote();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);

  // ── Step 0: customer search ─────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: results, isFetching: searching } = useSearchCustomers(debouncedTerm);

  const onSelectCustomer = useCallback((customer: UserProfile) => {
    setSelectedCustomer(customer);
    // Pre-fill vehicle from their first saved vehicle if available.
    const firstVehicle = customer.vehicles?.[0];
    if (firstVehicle) {
      const label = [firstVehicle.year, firstVehicle.make, firstVehicle.model]
        .filter(Boolean)
        .join(" ");
      setVehicleInfo(label);
    }
    setStep(1);
  }, []);

  // ── Step 1: quote details ───────────────────────────────────────────────────
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<number | null>(null);

  const toggleCategory = useCallback((label: string) => {
    setCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label],
    );
  }, []);

  const idRef = useRef(0);
  const makeItem = useCallback(
    (): LineItemDraft => ({ id: String(++idRef.current), name: "", price: "", quantity: "1" }),
    [],
  );
  const [items, setItems] = useState<LineItemDraft[]>(() => [makeItem()]);

  const updateItem = useCallback((index: number, patch: Partial<LineItemDraft>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }, []);
  const addItem = useCallback(() => setItems((prev) => [...prev, makeItem()]), [makeItem]);
  const removeItem = useCallback(
    (index: number) => setItems((prev) => prev.filter((_, i) => i !== index)),
    [],
  );

  const validItems = useMemo(
    () => items.filter((it) => it.name.trim() && num(it.price) > 0),
    [items],
  );
  const earnings = useMemo(
    () => validItems.reduce((sum, it) => sum + num(it.price) * qtyOf(it.quantity), 0),
    [validItems],
  );
  const total = earnings + PLATFORM_DEPOSIT;

  const canSubmit =
    !!selectedCustomer &&
    vehicleInfo.trim().length > 0 &&
    description.trim().length > 0 &&
    validItems.length > 0 &&
    earnings > 0 &&
    scheduledAt !== null &&
    !createCustomQuote.isPending &&
    !!currentUser;

  const onSubmit = useCallback(() => {
    if (!selectedCustomer || !currentUser || scheduledAt === null) return;
    const fullName = [currentUser.displayName].filter(Boolean).join(" ") || "Mechanic";
    const customerName =
      [selectedCustomer.firstName, selectedCustomer.lastName].filter(Boolean).join(" ") ||
      selectedCustomer.email ||
      "Customer";
    const orderItems: OrderItem[] = validItems.map((it) => ({
      name: it.name.trim(),
      description: null,
      price: num(it.price),
      quantity: qtyOf(it.quantity),
    }));
    createCustomQuote.mutate(
      {
        customerId: selectedCustomer.id,
        customerName,
        customerPhone: selectedCustomer.phone ?? null,
        providerId: currentUser.id,
        providerName: fullName,
        description: description.trim(),
        categories,
        vehicleInfo: vehicleInfo.trim(),
        items: orderItems,
        totalPrice: total,
        scheduledAt,
      },
      { onSuccess: () => router.back() },
    );
  }, [
    selectedCustomer,
    currentUser,
    scheduledAt,
    validItems,
    description,
    categories,
    vehicleInfo,
    total,
    createCustomQuote,
    router,
  ]);

  // ── Step 0 render ───────────────────────────────────────────────────────────
  // FlatList must NOT be nested inside a ScrollView (KeyboardSafeView).
  // Step 0 uses KeyboardSafeView with scrollable={false} so the FlatList owns
  // the vertical scroll while still getting the shared KeyboardAvoidingView.
  if (step === 0) {
    const showResults = debouncedTerm.length >= 2;
    const showPrompt = !showResults;
    const empty = showResults && !searching && (results?.length ?? 0) === 0;

    return (
      <KeyboardSafeView scrollable={false} style={styles.flex}>
        <View style={styles.searchHeader}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{MECHANIC_CUSTOM_QUOTE_COPY.searchTitle}</Text>
            <Text style={styles.stepSubtitle}>{MECHANIC_CUSTOM_QUOTE_COPY.searchSubtitle}</Text>
          </View>

          <TextInput
            label={MECHANIC_CUSTOM_QUOTE_COPY.searchPlaceholder}
            value={searchInput}
            onChangeText={setSearchInput}
            mode="outlined"
            autoFocus
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="magnify" color={colors.textSecondary} />}
            right={
              searching ? (
                <TextInput.Icon icon={() => <ActivityIndicator size={16} color={colors.primary} />} />
              ) : undefined
            }
            style={styles.searchInput}
          />
        </View>

        {(showPrompt || empty) && (
          <Text style={styles.prompt}>
            {showPrompt ? MECHANIC_CUSTOM_QUOTE_COPY.searchPrompt : MECHANIC_CUSTOM_QUOTE_COPY.noResults}
          </Text>
        )}

        {showResults && !searching && (results?.length ?? 0) > 0 && (
          <FlatList
            data={results}
            keyExtractor={(u) => u.id}
            contentContainerStyle={styles.resultsList}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CustomerResultCard customer={item} onSelect={onSelectCustomer} />
            )}
          />
        )}
      </KeyboardSafeView>
    );
  }

  // ── Step 1 render ───────────────────────────────────────────────────────────
  const customerLabel = selectedCustomer
    ? [selectedCustomer.firstName, selectedCustomer.lastName].filter(Boolean).join(" ") ||
      selectedCustomer.email
    : "";

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      {/* Selected customer chip + change link */}
      <View style={styles.selectedCustomerRow}>
        <View style={styles.selectedChip}>
          <Text style={styles.selectedChipText} numberOfLines={1}>
            {customerLabel}
          </Text>
        </View>
        <AppButton
          variant="tertiary"
          onPress={() => setStep(0)}
          disabled={createCustomQuote.isPending}
        >
          {MECHANIC_CUSTOM_QUOTE_COPY.changeCustomer}
        </AppButton>
      </View>

      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{MECHANIC_CUSTOM_QUOTE_COPY.quoteTitle}</Text>
        <Text style={styles.stepSubtitle}>{MECHANIC_CUSTOM_QUOTE_COPY.quoteSubtitle}</Text>
      </View>

      <AppTextInput
        label={MECHANIC_CUSTOM_QUOTE_COPY.vehicleLabel}
        value={vehicleInfo}
        onChangeText={setVehicleInfo}
        placeholder={MECHANIC_CUSTOM_QUOTE_COPY.vehiclePlaceholder}
        autoCapitalize="words"
      />

      <MultilineTextInput
        label={MECHANIC_CUSTOM_QUOTE_COPY.descriptionLabel}
        value={description}
        onChangeText={setDescription}
        placeholder={MECHANIC_CUSTOM_QUOTE_COPY.descriptionPlaceholder}
        numberOfLines={3}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{MECHANIC_CUSTOM_QUOTE_COPY.categoriesLabel}</Text>
        <FilterChips
          options={CUSTOM_QUOTE_CATEGORIES}
          selected={categories}
          onToggle={toggleCategory}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{MECHANIC_CUSTOM_QUOTE_COPY.lineItemsLabel}</Text>
        {items.map((item, index) => (
          <LineItemRow
            key={item.id}
            name={item.name}
            price={item.price}
            quantity={item.quantity}
            canRemove={items.length > 1}
            onChangeName={(v) => updateItem(index, { name: v })}
            onChangePrice={(v) => updateItem(index, { price: v })}
            onChangeQuantity={(v) => updateItem(index, { quantity: v })}
            onRemove={() => removeItem(index)}
          />
        ))}
        <AppButton variant="secondary" icon="plus" onPress={addItem}>
          {MECHANIC_CUSTOM_QUOTE_COPY.addItem}
        </AppButton>
      </View>

      <DateTimeField
        label={MECHANIC_CUSTOM_QUOTE_COPY.scheduledLabel}
        value={scheduledAt}
        onChange={setScheduledAt}
        minimumDate={new Date()}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{MECHANIC_CUSTOM_QUOTE_COPY.earnings}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(earnings)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{MECHANIC_CUSTOM_QUOTE_COPY.platformFee}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(PLATFORM_DEPOSIT)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>{MECHANIC_CUSTOM_QUOTE_COPY.customerTotal}</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
      </View>

      {createCustomQuote.isError && (
        <HelperText type="error" visible>
          {MECHANIC_CUSTOM_QUOTE_COPY.submitError}
        </HelperText>
      )}

      <AppButton onPress={onSubmit} loading={createCustomQuote.isPending} disabled={!canSubmit}>
        {createCustomQuote.isPending
          ? MECHANIC_CUSTOM_QUOTE_COPY.submitting
          : MECHANIC_CUSTOM_QUOTE_COPY.submit}
      </AppButton>
    </KeyboardSafeView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  searchHeader: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  stepHeader: {
    gap: spacing.xs,
  },
  stepTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  searchInput: {
    backgroundColor: colors.surface,
  },
  prompt: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  resultsList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  selectedCustomerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedChip: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  selectedChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.onPrimary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  summary: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.outline,
    marginVertical: spacing.xxs,
  },
  totalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
