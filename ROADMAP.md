# Fixd Refractor — Roadmap

> Recovered 2026-05-24 from a Claude Code session transcript after the chat
> history was lost. This is the canonical execution plan for the Fixd rebuild.
> Update the milestone status table as each milestone lands.

## Milestone status

| # | Milestone | Status | Notes |
|---|-----------|--------|-------|
| M1 | Foundation: Theme, Real Firebase, CometChat Init | DONE (commit 17ffd4f) | Verify CometChat is fully wired vs still a stub. |
| M2 | Onboarding Flow | NOT STARTED | Role selection -> slides -> profile setup -> notifications. |
| M3 | Customer: Services Tab & Quote Request | NOT STARTED | Depends on M2. |
| M4 | Customer: Requests/Orders Tab & Profile Tab | NOT STARTED | Depends on M3. |
| M5 | Provider: Marketplace Tab & Queue Tab | NOT STARTED | Depends on M3. |
| M6 | Provider: Profile Tab & Performance | NOT STARTED | Depends on M5. |
| M7 | Messaging (CometChat) | NOT STARTED | Depends on M4 + M6. |
| M8 | Admin Flow | NOT STARTED | Can start after M3 + M5. |
| M9 | Payments | NOT STARTED | Depends on M4 + M5. |
| M10 | Polish: Cloud Functions, Push, Security Rules | NOT STARTED | Last — after everything. |

---

# Fixd Refractor — Full Rebuild Plan

## Context

The old Fixd app (Fixd_2026) is a working marketplace app (~43 screens) that connects customers needing vehicle repair with mechanics. It was vibe-coded with pain points: hardcoded colors/spacing everywhere, flat screen structure mixing logic and UI, and Firestore for messaging. The goal is to rebuild it in `fixd_refractor` — which already has a proper scaffold (Expo Router, React Query, Firebase Auth, centralized theme, page/view/component architecture, skills infrastructure) — keeping the same UI but with clean architecture, CometChat messaging, and a new onboarding flow.

**Skills available:** `build-performant-component`, `data-hook-firebase`, `theme-setup`, `scaffold-rn-project`, `wire-up-agents-md`

**Architecture enforced:** Feature-scoped 3-tier (page → view → component). Every file in `src/page/<feature>/`. Services are the only files that touch Firebase/CometChat SDKs. Hooks wrap services with React Query. Components are dumb (props in, JSX out, theme tokens only).

---

## What Already Exists in fixd_refractor

- `app/` — `_layout.tsx` (auth gate), `(auth)/sign-in|sign-up`, `(tabs)/index`
- `src/page/auth/` — full 3-tier: sign-in, sign-up, welcome pages + views + components (AuthInput, AuthButton) + hooks (useSignIn, useSignUp, useUserProfile) + interfaces
- `src/providers/` — `AppProviders`, `AuthProvider` (onAuthStateChanged), `QueryProvider`
- `src/services/` — `firebase.ts` (mock, `db=null`), `auth-service.ts`, `user-service.ts` (mock)
- `src/theme/` — `colors.ts` (wrong primary), `spacing.ts`, `typography.ts`, `radii.ts`, `shadows.ts`, `theme.ts` — full token system, needs color update
- `guidelines/` + `.agents/skills/` — all rules and skills present

---

## Milestone 1 — Foundation: Theme, Real Firebase, CometChat Init

**Goal:** App boots with correct purple Fixd theme, real Firebase Firestore live, CometChat SDK initialized, and auth gate updated for role-based routing. No new screens yet.

### 1A — Fix Theme Colors
Edit `src/theme/colors.ts`. Swap teal primary for Fixd's purple palette:
```
primary: "#5B57F5"        (was #0099CC)
secondary: "#7C5CFF"
background: "#E8E9F3"     (was #FFFFFF) — Fixd's lavender bg
surface: "#FFFFFF"
surfaceVariant: "#D1D3E8"
textPrimary: "#14142B"
textSecondary: "#4E4B66"
```
Edit `src/theme/theme.ts`: change `export const appTheme = darkTheme` → `= lightTheme`.

### 1B — Replace Firebase Mock with Real SDK
Replace `src/services/firebase.ts` with real Firebase init using `initializeApp`, `getAuth`, `getFirestore`. Firebase package already installed (`^10.12.0`). Requires `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) from Firebase console.

Also fix `src/services/user-service.ts` — replace in-memory mock with real Firestore `getDoc`/`setDoc`/`updateDoc` calls on the `users` collection.

### 1C — Install and Init CometChat SDK
```
npm install @cometchat/chat-sdk-react-native
```
⚠️ CometChat requires native modules → must use Expo Dev Client (not Expo Go) from this milestone onward.

Create `src/services/comet-chat-service.ts` — the ONLY file in the codebase that imports from `@cometchat/chat-sdk-react-native`. Exports:
- `init()` — `CometChat.init(APP_ID, settings)`
- `login(uid)` — `CometChat.login(uid, AUTH_KEY)`
- `logout()`
- `getConversations()`
- `getMessages(conversationUID)`
- `sendTextMessage(receiverUID, text, type)`
- `addMessageListener(id, callbacks)` / `removeMessageListener(id)`

Store `COMET_CHAT_APP_ID`, `COMET_CHAT_AUTH_KEY`, `COMET_CHAT_REGION` in `.env` (never hardcoded).

Create `src/providers/comet-chat-provider.tsx` — calls `cometChatService.init()` on mount, exposes `isCometChatReady` context.

Add to `src/providers/app-providers.tsx` provider chain: `PaperProvider → QueryProvider → CometChatProvider → AuthProvider → children`.

### 1D — Extend AuthProvider with Role + Onboarding Flag
Update `AuthContextValue` in `src/providers/auth-provider.tsx`:
```ts
role: "customer" | "provider" | "owner" | undefined
hasCompletedOnboarding: boolean
isHydrated: boolean  // true only after BOTH Firebase auth + Firestore user doc are read
```
`onAuthStateChanged` now reads the user's Firestore doc to populate `role` and `hasCompletedOnboarding`. `isHydrated` only becomes `true` after this secondary read completes.

### 1E — Update Auth Gate in `app/_layout.tsx`
Multi-branch routing (guarded by `isHydrated`):
```
!isHydrated               → render nothing (splash/loading)
!currentUser              → replace("/(auth)/sign-in")
!hasCompletedOnboarding   → replace("/(onboarding)/role-selection")
role === 'customer'       → replace("/(customer-tabs)")
role === 'provider'       → replace("/(provider-tabs)")
role === 'owner'          → replace("/(admin-tabs)")
```

### 1F — CometChat Login After Auth
Add `src/page/auth/hooks/use-comet-chat-login.ts` — calls `cometChatService.login(uid)`. Called in `useSignIn` and `useSignUp` `onSuccess` callbacks.

**Files modified/created in M1:**
`src/theme/colors.ts`, `src/theme/theme.ts`, `src/services/firebase.ts`, `src/services/user-service.ts`, `src/services/comet-chat-service.ts`, `src/providers/comet-chat-provider.tsx`, `src/providers/app-providers.tsx`, `src/providers/auth-provider.tsx`, `app/_layout.tsx`, `src/page/auth/hooks/use-comet-chat-login.ts`, `src/types/user.interface.ts`

---

## Milestone 2 — Onboarding Flow

**Goal:** Post sign-up users complete role selection → welcome slides → role-specific profile setup → notification permission, then land in their tab group.

**Skills:** `build-performant-component` × 3, `data-hook-firebase` for mutations

### New Expo Router Files
```
app/(onboarding)/
├── _layout.tsx              Stack, headerShown: false
├── role-selection.tsx
├── welcome-slides.tsx
├── vehicle-setup.tsx        (customer path)
├── mechanic-profile.tsx     (provider path)
└── notifications.tsx
```

### New Feature Folder: `src/page/onboarding/`
```
├── onboarding.constants.ts      (slide content, specialties list)
├── role-selection.page.tsx
├── welcome-slides.page.tsx
├── vehicle-setup.page.tsx
├── mechanic-profile.page.tsx
├── notifications.page.tsx
├── views/
│   ├── role-selection.view.tsx          (two RoleCards: Customer / Mechanic)
│   ├── welcome-slides.view.tsx          (FlatList of 3 slides + Next/Get Started)
│   ├── vehicle-setup.view.tsx           (RHF+Zod form: make, model, year, color, plate)
│   ├── vehicle-setup-*.view.tsx         (loading/error/success)
│   ├── mechanic-profile.view.tsx        (form: bio, specialties chips, years experience)
│   ├── mechanic-profile-*.view.tsx
│   └── notifications.view.tsx           (permission request + skip)
├── components/
│   ├── role-card.component.tsx          → invoke build-performant-component
│   ├── onboarding-step-indicator.component.tsx → invoke build-performant-component
│   ├── welcome-slide.component.tsx      → invoke build-performant-component
│   └── index.ts
└── hooks/
    ├── use-save-vehicle.ts              (useMutation → userService.saveVehicle)
    ├── use-save-mechanic-profile.ts     (useMutation → userService.saveMechanicProfile)
    └── use-complete-onboarding.ts       (useMutation → writes role + hasCompletedOnboarding=true)
```

### Flow Logic
- Role stored as URL param and passed screen-to-screen (no global state needed)
- Customer path: role-selection → welcome-slides → vehicle-setup → notifications
- Provider path: role-selection → welcome-slides → mechanic-profile → notifications
- `use-complete-onboarding` writes `role` + `hasCompletedOnboarding: true` to Firestore; on success invalidates `["userProfile"]` which causes `AuthProvider` to re-read and the auth gate to redirect to the correct tab group

**New methods on `user-service.ts`:** `saveVehicle()`, `saveMechanicProfile()`, `completeOnboarding()`

---

## Milestone 3 — Customer: Services Tab & Quote Request

**Goal:** Customer's Services tab is live — home screen, service categories, emergency banner, multi-step quote request form with image upload.

**Skills:** `build-performant-component` × 2, `data-hook-firebase` for mutations

### New Expo Router Files
```
app/(customer-tabs)/
├── _layout.tsx                  Tabs: services, requests, messages, profile
└── services/
    ├── _layout.tsx              Stack
    ├── index.tsx                → customer-home.page.tsx
    └── quote-request.tsx        → quote-request.page.tsx
```

### New Feature Folders

**`src/page/customer-home/`**
- `customer-home-success.view.tsx` renders: welcome header, emergency banner, service category cards (horizontal scroll from `onboarding.constants.ts`), "Request a Quote" CTA
- Components: `service-category-card.component.tsx`, `emergency-banner.component.tsx`, `section-header.component.tsx` — invoke `build-performant-component`

**`src/page/quote-request/`**
- 5-step flow managed by local `useState` (UI state — acceptable in view)
  - Step 1: Description + category
  - Step 2: Vehicle confirmation (pre-filled from `useUserProfile`)
  - Step 3: Location (address string, no maps SDK in V1)
  - Step 4: Image upload (expo-image-picker, up to 5)
  - Step 5: Review + Submit
- Hooks: `use-create-order.ts` (useMutation → `orderService.createOrder`), `use-upload-images.ts` (useMutation → `storageService.uploadOrderImages`)
- On success: navigates to `/(customer-tabs)/requests`

### New Services Created in M3
**`src/services/order-service.ts`** — ONLY file reading/writing `repair-orders` collection:
- `createOrder(data)` — sets `expiresAt = now + 24hrs`, `status: 'Pending'`
- `getOrderById(id)`, `getOrdersByCustomer(uid)`, `getOrdersByProvider(uid)`, `getAvailableOrders()`
- `updateOrderStatus(id, status, extra?)`, `updateOrderProvider(id, providerId, name)`

**`src/services/storage-service.ts`** — Firebase Storage:
- `uploadOrderImages(userId, orderId, uris[])` → returns `mediaUrls[]`

---

## Milestone 4 — Customer: Requests/Orders Tab & Profile Tab

**Goal:** Customers can view active quotes and order history, see order detail, manage vehicles, update account.

**Skills:** `data-hook-firebase` × 3, `build-performant-component` × 3

### New Expo Router Files
```
app/(customer-tabs)/
├── requests/
│   ├── _layout.tsx
│   ├── index.tsx              → customer-requests.page.tsx
│   ├── quotes.tsx             → customer-quotes.page.tsx
│   └── [orderId].tsx          → order-detail.page.tsx (shared with provider)
└── profile/
    ├── _layout.tsx
    ├── index.tsx              → customer-profile.page.tsx
    ├── vehicles.tsx           → vehicle-management.page.tsx
    ├── add-vehicle.tsx        → add-vehicle.page.tsx (reuses M2 form)
    ├── account-settings.tsx   → account-settings.page.tsx
    └── privacy-settings.tsx   → privacy-settings.page.tsx
```

### Key Feature Folders

**`src/page/customer-requests/`** — `SegmentedButtons` tab switcher (Active / History), filters `useCustomerOrders` client-side. Components: `order-list-item.component.tsx`, `order-status-badge.component.tsx`.

**`src/page/order-detail/`** (shared Customer + Provider — renders role-aware actions via `useAuthContext()` in view, not component):
- Components: `order-info-section.component.tsx`, `order-timeline.component.tsx`, `order-action-buttons.component.tsx` (accepts `actions: ActionConfig[]` prop — stays dumb)
- Customer + Pending → "Cancel", "Message Provider"
- Customer + Completed → "Rate Mechanic"
- Provider actions added in M5

**`src/page/vehicle-management/`** — `useVehicles`, `useAddVehicle`, `useDeleteVehicle` hooks. Reuses vehicle form from M2.

**`src/page/account-settings/`** — calls `auth-service.updateEmail()`, `auth-service.updatePassword()`.

**`src/page/privacy-settings/`** — useMutation updates `users/{uid}.notificationPreferences`.

---

## Milestone 5 — Provider: Marketplace Tab & Queue Tab

**Goal:** Providers can browse available orders, accept them, manage their active queue, update status, fill inspection checklists, create custom charges.

**Skills:** `data-hook-firebase` × 3, `build-performant-component` × 3

### New Expo Router Files
```
app/(provider-tabs)/
├── _layout.tsx                  Tabs: marketplace, queue, messages, profile
├── marketplace/
│   ├── _layout.tsx
│   ├── index.tsx                → marketplace.page.tsx
│   └── [orderId].tsx            → request-detail.page.tsx
└── queue/
    ├── _layout.tsx
    ├── index.tsx                → provider-queue.page.tsx
    ├── [orderId].tsx            → order-detail.page.tsx (provider context)
    ├── [orderId]/inspection.tsx → inspection-checklist.page.tsx
    ├── [orderId]/start.tsx      → request-start.page.tsx
    └── [orderId]/custom-charge.tsx → custom-charge.page.tsx
```

### Key Feature Folders

**`src/page/marketplace/`** — category filter chips (`useState` for filter — UI state), `FlatList` of `MarketplaceOrderCard`.

**`src/page/request-detail/`** (provider's pre-accept view) — `use-accept-order.ts` mutation:
1. Updates Firestore: `{ providerId, providerName, status: 'Accepted', acceptedAt }`
2. Ensures CometChat 1:1 conversation exists between provider UID and customer UID
3. Invalidates `["available-orders"]` + `["provider-orders"]`

**`src/page/provider-queue/`** — groups by status: active/scheduled/completed. Card shows contextual action button per status.

**`src/page/inspection-checklist/`** — multi-section RHF form (pre-service: mileage, fuel, damage, photos, signature; work performed; post-service: completion notes, photos, quality check).

**`src/page/custom-charge/`** — dynamic line-item form, running total calculated client-side. Submits to `repair-orders/{id}.items[]`.

**`src/page/update-status/`** — status transitions: Accepted→Scheduled (date picker), Scheduled→InProgress, InProgress→Completed (triggers payment collection CTA).

### New Service
**`src/services/order-form-service.ts`** — ONLY file for `order-forms` collection: `createForm()`, `getFormByOrderId()`, `updateForm()`.

---

## Milestone 6 — Provider: Profile Tab & Performance

**Goal:** Provider profile tab with availability toggle, performance stats, editable profile, account settings.

**Skills:** `build-performant-component` × 2, `data-hook-firebase` × 2

### New Expo Router Files
```
app/(provider-tabs)/profile/
├── _layout.tsx
├── index.tsx          → provider-profile.page.tsx
├── performance.tsx    → performance-details.page.tsx
├── edit.tsx           → provider-profile-edit.page.tsx
├── account-settings.tsx  (reuse from M4)
└── change-password.tsx   → change-password.page.tsx
```

**`src/page/provider-profile/`** — availability toggle (Paper `Switch`, calls `useToggleAvailability`), stat summary, nav buttons.

**`src/page/performance-details/`** — monthly earnings table (no chart library in V1), total jobs, avg rating, recent completed orders list. Reads `analytics/mechanics/{uid}` (populated by Cloud Functions in M10 — stub with empty state until then).

**`src/page/provider-profile-edit/`** — bio, specialties (chip multi-select), years experience, photo upload via `storageService.uploadProfileImage()`.

---

## Milestone 7 — Messaging (CometChat)

**Goal:** Both customer and provider have a working real-time messaging experience. No Firestore — all data from CometChat SDK.

**Skills:** `build-performant-component` × 3

### New Expo Router Files
```
app/(customer-tabs)/messages/
├── _layout.tsx
├── index.tsx                    → customer-messaging.page.tsx
└── [conversationId].tsx         → chat.page.tsx (SHARED)

app/(provider-tabs)/messages/
├── _layout.tsx
├── index.tsx                    → provider-messaging.page.tsx
└── [conversationId].tsx         → chat.page.tsx (SHARED)
```

### Key Feature Folders

**`src/page/chat/`** (shared):
- `use-messages.ts` — wraps `cometChatService.getMessages()` with `useState`/`useEffect` pattern (not React Query — CometChat is not Firestore). Returns `{ data, isLoading, isError }` shape to keep the view switch pattern intact.
- `use-send-message.ts` — mutation wrapper around `cometChatService.sendTextMessage`
- `use-message-listener.ts` — real-time subscription that appends incoming messages to state
- Components: `message-bubble.component.tsx` (prop: `isOwnMessage: boolean`, aligns left/right with theme tokens), `message-input-bar.component.tsx`

**`src/page/customer-messaging/`** and **`src/page/provider-messaging/`** — identical structure, `FlatList` of `ConversationListItem` (name, last message, timestamp, unread badge). Tapping navigates to `messages/${otherPartyUID}?orderId=...`.

### Conversation ID Convention
- Pre-acceptance: navigate with `receiverUID` = other party's Firebase UID. Order context passed as URL param `orderId`.
- Active order: same — CometChat 1:1 conversation keyed by participant UIDs.
- Chat page header shows order snippet when `orderId` param is present.

### Navigation Wires
Order detail action button "Message Provider/Customer" navigates to `messages/${otherPartyUID}?orderId=${orderId}`.

---

## Milestone 8 — Admin Flow

**Goal:** Owner users have a dedicated tab group to manage all orders, mechanics, and view platform earnings.

**Skills:** `data-hook-firebase` × 3, `build-performant-component` × 2

### New Expo Router Files
```
app/(admin-tabs)/
├── _layout.tsx           Tabs: orders, mechanics, earnings, settings
├── orders/index.tsx, [orderId].tsx
├── mechanics/index.tsx, [mechanicId].tsx
├── earnings/index.tsx
└── settings/index.tsx
```

### Key Features
- **All Orders** — filterable by status with `SegmentedButtons`. Tap → order-detail (admin context adds "Assign to Mechanic" action using a bottom sheet mechanic picker, calls `orderService.assignOrderToProvider()`).
- **Mechanics List** — list with availability indicator, job count. Detail → full provider profile + `isActive` toggle (`use-toggle-mechanic-active`).
- **Earnings Dashboard** — reads `analytics/daily/{date}` for current week: platform fee total, per-mechanic earnings table, order counts by category (stub with 0s until M10 Cloud Functions are live).

**New service methods:**
- `orderService.getAllOrders(filters?)`, `orderService.assignOrderToProvider()`
- `userService.getMechanics()`, `userService.toggleMechanicActive()`

---

## Milestone 9 — Payments

**Goal:** $20 Stripe deposit flow (customer) + cash payment recording (provider) + payment status tracking.

```
npm install @stripe/stripe-react-native
```
Requires dev client build (native module). Update `eas.json` dev profile with `expo-build-properties` Stripe config.

### New Expo Router Files
```
app/(customer-tabs)/requests/[orderId]/payment.tsx   → payment.page.tsx
app/(provider-tabs)/queue/[orderId]/collect-payment.tsx → collect-payment.page.tsx
```

### New Service
**`src/services/payment-service.ts`:**
- `createStripePaymentIntent(orderId)` — calls Firebase Callable Function, returns `clientSecret`
- `confirmStripePayment(clientSecret)` — Stripe SDK `presentPaymentSheet`
- `recordCashPayment(orderId, amount)` — calls Firebase Callable Function

### New Firebase Callable Functions
- `createStripePaymentIntent` — creates Stripe PaymentIntent for $20, returns `clientSecret`
- `recordCashPayment` — creates `transactions` doc, updates `repair-orders.paymentStatus = 'paid'`

### New Service
**`src/services/transaction-service.ts`:** `getTransactionsByOrder()`, `getTransactionsByProvider()`

---

## Milestone 10 — Polish: Cloud Functions, Push Notifications, Security Rules

**Goal:** Full production infrastructure — orders auto-expire, notifications fire on key events, analytics aggregate, Firestore security rules locked down.

### 10A — Cloud Functions (`/functions/src/`)
- `expire-orders.ts` — scheduled hourly: mark Pending orders past `expiresAt` as Expired, push notify customer
- `on-order-create.ts` — Firestore onCreate: set `expiresAt = +24hrs`, notify available mechanics via FCM
- `on-order-status-change.ts` — Firestore onUpdate: status-to-notification mapping, increment analytics
- `on-user-create.ts` — Auth onCreate: create `users/{uid}` doc with defaults
- `generate-daily-analytics.ts` — scheduled midnight: aggregate to `analytics/daily/{date}` + `analytics/mechanics/{uid}`

### 10B — Push Notifications
**`src/services/notification-service.ts`:** `registerForPushNotifications()`, `handleForegroundNotification()`, `handleNotificationResponse()`.

Wire into `app/_layout.tsx` after auth hydration. Deep-link routing on tap: new message → `messages/[id]`, order update → `requests/[id]` or `queue/[id]`, new order (mechanic) → `marketplace`.

### 10C — Firestore Security Rules
Write `firestore.rules` per BACKEND_DESIGN.md section 7:
- Users: own read/write; owner full access
- repair-orders: participants read/write; providers can read Pending (marketplace); customers create
- order-forms: provider + owner only
- transactions: participants read; write = Cloud Functions only
- analytics: providers + owner read; write = Cloud Functions only

---

## Complete Services Layer

| File | Milestone | Purpose |
|---|---|---|
| `firebase.ts` | M1 | Real Firebase init (replaces mock) |
| `auth-service.ts` | M1 | Add `updateEmail`, `updatePassword` |
| `user-service.ts` | M1 | Real Firestore reads/writes |
| `comet-chat-service.ts` | M1 | All CometChat SDK — only file that imports CometChat |
| `order-service.ts` | M3 | All `repair-orders` Firestore ops |
| `storage-service.ts` | M3 | Firebase Storage uploads |
| `order-form-service.ts` | M5 | `order-forms` Firestore ops |
| `transaction-service.ts` | M9 | `transactions` Firestore reads |
| `payment-service.ts` | M9 | Stripe SDK + Firebase Callable Functions |
| `notification-service.ts` | M10 | Expo Notifications + FCM token |

---

## Dependency Graph

```
M1 (Foundation: theme, Firebase real, CometChat init)
 └── M2 (Onboarding flow)
      └── M3 (Customer: Services tab + quote request)
           ├── M4 (Customer: Requests tab + profile)
           │    └── M7 (Messaging — customer side)
           └── M5 (Provider: Marketplace + Queue)
                ├── M6 (Provider: Profile tab)
                │    └── M7 (Messaging — provider side)
                ├── M8 (Admin — can start after M3+M5)
                └── M9 (Payments — after M4+M5)
                     └── M10 (Polish — everything done)
```

M7, M8, M9 can be worked in parallel once M5 is complete.

---

## Verification

Each milestone is verified by:
1. Boot app on dev client (`eas build --profile development` or `expo run:ios/android`)
2. Walk through the feature flow end-to-end
3. Check that no hardcoded colors/spacing appear in new files (search for `#`, `px`, literal numbers in StyleSheet)
4. Confirm services are the only files importing `firebase/*` or `@cometchat/*`
5. For messaging (M7): verify real-time messages appear without app restart
6. For payments (M9): use Stripe test cards, verify `transactions` doc created in Firestore

**Theme showcase** (`/theme-showcase` route) is always available to visually verify token changes are reflected correctly.
