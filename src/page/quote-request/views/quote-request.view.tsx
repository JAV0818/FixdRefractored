// The quote-request wizard. Owns the multi-step UI state (step index, chosen
// photos) and the form (react-hook-form + Zod). Validates one step at a time
// with `trigger`, opens the image picker as a side effect, and on submit
// creates the order then attaches any photos before redirecting to Requests.

import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, Text } from "react-native-paper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { DateTimeField, KeyboardSafeView } from "@/components";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import { SERVICE_CATEGORIES } from "@/constants/service-categories";
import { formatDateTime } from "@/utils/format";

import { CategoryChips, FormTextField, ImagePickerGrid, StepIndicator } from "../components";
import { useCreateOrder } from "../hooks/use-create-order";
import { useUploadImages } from "../hooks/use-upload-images";
import { MAX_QUOTE_IMAGES, QUOTE_REQUEST_COPY } from "../quote-request.constants";
import {
  QUOTE_STEP_FIELDS,
  quoteRequestSchema,
  type QuoteRequestForm,
} from "../interfaces/quote-request.interface";

const LAST_STEP = QUOTE_REQUEST_COPY.steps.length - 1;

const labelForCategoryId = (id?: string) => SERVICE_CATEGORIES.find((c) => c.id === id)?.label;

export const QuoteRequestView = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const presetCategory = labelForCategoryId(category);

  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const createOrder = useCreateOrder();
  const uploadImages = useUploadImages();
  const isSubmitting = createOrder.isPending || uploadImages.isPending;
  const submitFailed = createOrder.isError || uploadImages.isError;

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<QuoteRequestForm>({
    resolver: zodResolver(quoteRequestSchema),
    mode: "onTouched",
    defaultValues: {
      description: "",
      categories: presetCategory ? [presetCategory] : [],
      vehicleInfo: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const selectedCategories = watch("categories");

  const toggleCategory = useCallback(
    (label: string) => {
      const current = getValues("categories");
      const next = current.includes(label)
        ? current.filter((c) => c !== label)
        : [...current, label];
      setValue("categories", next, { shouldValidate: true });
    },
    [getValues, setValue],
  );

  const pickImages = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo access needed",
        "Allow photo library access to attach pictures to your request.",
      );
      return;
    }

    const remaining = MAX_QUOTE_IMAGES - images.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (result.canceled) return;

    const picked = result.assets.map((a) => a.uri);
    setImages((prev) => [...prev, ...picked].slice(0, MAX_QUOTE_IMAGES));
  }, [images.length]);

  const removeImage = useCallback((uri: string) => {
    setImages((prev) => prev.filter((u) => u !== uri));
  }, []);

  const onValid = useCallback(
    async (values: QuoteRequestForm) => {
      try {
        const orderId = await createOrder.mutateAsync(values);
        if (images.length > 0) {
          await uploadImages.mutateAsync({ orderId, uris: images });
        }
        // Leave the wizard: pop the services stack back to its root first, then
        // switch to the Requests tab so the new order is visible. Replacing from
        // deep in the stack alone doesn't reliably switch tabs (leaves the user
        // stuck on the last step).
        if (router.canDismiss()) router.dismissAll();
        router.replace("/(customer-tabs)/requests");
      } catch {
        // Surfaced via submitFailed below; nothing else to do here.
      }
    },
    [createOrder, uploadImages, images, router],
  );

  const goNext = useCallback(async () => {
    const fields = QUOTE_STEP_FIELDS[step];
    const ok = fields.length ? await trigger(fields) : true;
    if (!ok) return;
    if (step < LAST_STEP) setStep((s) => s + 1);
    else handleSubmit(onValid)();
  }, [step, trigger, handleSubmit, onValid]);

  const goBack = useCallback(() => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  }, [step, router]);

  const heading = QUOTE_REQUEST_COPY.steps[step];

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      <StepIndicator current={step} total={QUOTE_REQUEST_COPY.steps.length} />

      <View style={styles.header}>
        <Text style={styles.title}>{heading.title}</Text>
        <Text style={styles.subtitle}>{heading.subtitle}</Text>
      </View>

      <View style={styles.body}>
        {step === 0 && (
          <>
            <FormTextField
              control={control}
              name="description"
              label="Describe the issue"
              placeholder="e.g. Grinding noise when braking"
              multiline
            />
            <CategoryChips selected={selectedCategories} onToggle={toggleCategory} />
          </>
        )}

        {step === 1 && (
          <FormTextField
            control={control}
            name="vehicleInfo"
            label="Vehicle"
            placeholder="e.g. 2019 Toyota Camry"
            autoCapitalize="words"
          />
        )}

        {step === 2 && (
          <>
            <FormTextField
              control={control}
              name="address"
              label="Street address"
              autoCapitalize="words"
            />
            <FormTextField
              control={control}
              name="city"
              label="City (optional)"
              autoCapitalize="words"
            />
            <FormTextField
              control={control}
              name="state"
              label="State (optional)"
              autoCapitalize="characters"
            />
            <FormTextField
              control={control}
              name="zip"
              label="ZIP (optional)"
              keyboardType="numeric"
            />
            <DateTimeField
              label="Preferred date & time"
              value={watch("scheduledAt") ?? null}
              onChange={(ts) => setValue("scheduledAt", ts, { shouldValidate: true })}
              minimumDate={new Date()}
            />
            {errors.scheduledAt && (
              <HelperText type="error" visible>
                {errors.scheduledAt.message}
              </HelperText>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <ImagePickerGrid
              uris={images}
              max={MAX_QUOTE_IMAGES}
              onAdd={pickImages}
              onRemove={removeImage}
            />
            <Text style={styles.hint}>{QUOTE_REQUEST_COPY.photosHint}</Text>
          </>
        )}

        {step === 4 && <ReviewSummary values={getValues()} photoCount={images.length} />}
      </View>

      {submitFailed && (
        <HelperText type="error" visible style={styles.submitError}>
          {QUOTE_REQUEST_COPY.submitError}
        </HelperText>
      )}

      <View style={styles.footer}>
        <Button
          mode="text"
          onPress={goBack}
          disabled={isSubmitting}
          textColor={colors.textSecondary}
        >
          {QUOTE_REQUEST_COPY.back}
        </Button>
        <Button
          mode="contained"
          onPress={goNext}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.primaryButton}
        >
          {step < LAST_STEP
            ? QUOTE_REQUEST_COPY.next
            : isSubmitting
              ? QUOTE_REQUEST_COPY.submitting
              : QUOTE_REQUEST_COPY.submit}
        </Button>
      </View>
    </KeyboardSafeView>
  );
};

// Inline review — a sub-state of the final step, not its own data screen.
type ReviewSummaryProps = {
  values: QuoteRequestForm;
  photoCount: number;
};

const ReviewSummary = ({ values, photoCount }: ReviewSummaryProps) => {
  const { review } = QUOTE_REQUEST_COPY;
  const location = [values.address, values.city, values.state, values.zip]
    .filter(Boolean)
    .join(", ");

  const rows: { label: string; value: string }[] = [
    { label: review.description, value: values.description || review.none },
    { label: review.categories, value: values.categories.join(", ") || review.none },
    { label: review.vehicle, value: values.vehicleInfo || review.none },
    { label: review.location, value: location || review.none },
    { label: review.when, value: values.scheduledAt ? formatDateTime(values.scheduledAt) : review.none },
    { label: review.photos, value: photoCount > 0 ? `${photoCount} attached` : review.none },
  ];

  return (
    <View style={styles.reviewCard}>
      {rows.map((row) => (
        <View key={row.label} style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>{row.label}</Text>
          <Text style={styles.reviewValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  body: {
    gap: spacing.md,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  submitError: {
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radii.lg,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  reviewRow: {
    gap: spacing.xxs,
  },
  reviewLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reviewValue: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
});
