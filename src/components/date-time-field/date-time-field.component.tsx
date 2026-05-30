// DateTimeField — a tappable field that opens a bottom-sheet picker and returns
// the chosen date+time as a timestamp. Uses an explicit two-step spinner
// (date → time) with Next/Done buttons so it behaves the same on iOS and
// Android (the inline pickers' auto-dismiss/hand-off is unreliable). Local UI
// state only; no data.

import { useState } from "react";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import { formatDateTime } from "@/utils/format";

type DateTimeFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  placeholder?: string;
  minimumDate?: Date;
};

export const DateTimeField = ({
  label,
  value,
  onChange,
  placeholder = "Select date & time",
  minimumDate,
}: DateTimeFieldProps) => {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"date" | "time">("date");
  const [draft, setDraft] = useState<Date>(new Date());

  const start = () => {
    setDraft(value ? new Date(value) : (minimumDate ?? new Date()));
    setPhase("date");
    setOpen(true);
  };

  // The spinner mutates the draft live; the date phase carries the date forward,
  // so the time phase (mode="time") only changes the hours/minutes on it.
  const onSpin = (_event: DateTimePickerEvent, selected?: Date) => {
    if (selected) setDraft(selected);
  };

  const cancel = () => setOpen(false);
  const next = () => setPhase("time");
  const confirm = () => {
    setOpen(false);
    onChange(draft.getTime());
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={start} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
        <Text style={[styles.value, value === null && styles.placeholder]}>
          {value !== null ? formatDateTime(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={cancel}>
        <Pressable style={styles.backdrop} onPress={cancel}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>
              {phase === "date" ? "Pick a date" : "Pick a time"}
            </Text>
            <DateTimePicker
              value={draft}
              mode={phase}
              display="spinner"
              minimumDate={phase === "date" ? minimumDate : undefined}
              onChange={onSpin}
              themeVariant="light"
            />
            <View style={styles.actions}>
              <Button onPress={cancel} textColor={colors.textSecondary}>
                Cancel
              </Button>
              {phase === "date" ? (
                <Button mode="contained" onPress={next}>
                  Next
                </Button>
              ) : (
                <Button mode="contained" onPress={confirm}>
                  Done
                </Button>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  value: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlayDark,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sheetTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
