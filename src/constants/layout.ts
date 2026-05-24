// Layout constants shared across the app.
//
// FLOATING_TAB_HEIGHT  — the rendered height of the floating pill tab bar.
// FLOATING_TAB_MARGIN  — horizontal + bottom margin around the pill.
// TAB_BAR_CLEARANCE    — total vertical space screens must reserve at the
//                        bottom so content isn't hidden behind the tab bar.
//                        Usage: add as paddingBottom to ScrollView / FlatList
//                        contentContainerStyle, or as marginBottom on fixed-
//                        bottom CTAs.
//
// Example:
//   <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}>

export const FLOATING_TAB_HEIGHT = 64;
export const FLOATING_TAB_MARGIN = 32;

// FLOATING_TAB_HEIGHT (64) + FLOATING_TAB_MARGIN (52) + 16 extra breathing room.
// SafeAreaView handles the home indicator automatically; ScrollView / FlatList
// contentContainerStyle needs this added manually.
export const TAB_BAR_CLEARANCE = FLOATING_TAB_HEIGHT + FLOATING_TAB_MARGIN + 16;
