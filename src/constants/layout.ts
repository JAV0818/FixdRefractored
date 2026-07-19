// Layout constants shared across the app.
//
// FLOATING_TAB_HEIGHT              — the rendered height of the floating pill tab bar.
// FLOATING_TAB_MARGIN              — horizontal margin around the pill.
// FLOATING_TAB_CENTER_BUTTON_SIZE  — diameter of the prominent center action button.
// FLOATING_TAB_CENTER_BUTTON_PROTRUSION
//                                  — how far the center button rises above the dock.
// TAB_BAR_CLEARANCE                — total vertical space screens must reserve at the
//                                    bottom so content isn't hidden behind the tab bar.
//                                    Usage: add as paddingBottom to ScrollView / FlatList
//                                    contentContainerStyle, or as marginBottom on fixed-
//                                    bottom CTAs.
//
// Example:
//   <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}>

import { spacing } from "@/theme";

export const FLOATING_TAB_HEIGHT = 64;
export const FLOATING_TAB_MARGIN = 32;
export const FLOATING_TAB_CENTER_BUTTON_SIZE = 64;
export const FLOATING_TAB_CENTER_BUTTON_PROTRUSION = spacing["3"];

// FLOATING_TAB_HEIGHT + bottom margin + center button protrusion + extra breathing room.
// SafeAreaView handles the home indicator automatically; ScrollView / FlatList
// contentContainerStyle needs this added manually.
export const TAB_BAR_CLEARANCE =
  FLOATING_TAB_HEIGHT + spacing["3"] + FLOATING_TAB_CENTER_BUTTON_PROTRUSION + 16;
