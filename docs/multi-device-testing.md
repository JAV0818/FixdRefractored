# Multi-Device Testing Guide

This project uses **Expo Development Builds** (not Expo Go) because CometChat requires native iOS/Android modules. That means every test device needs a compatible native build installed.

---

## Option 1: Test on your own second iPhone (dev client)

Best for rapid iteration. Both phones must be on the same Wi-Fi network, or you use `--tunnel`.

### Step 1 — Add the second iPhone to your Apple Developer account

1. On the second iPhone, open Safari and go to:
   `https://udid.tech` or `https://get.udid.io`
2. Follow the steps to install the profile and copy the **UDID**.
3. Go to [Apple Developer → Devices](https://developer.apple.com/account/resources/devices/list) and add the UDID.

### Step 2 — Rebuild the dev client with EAS

```bash
eas build --profile development --platform ios
```

EAS will regenerate the provisioning profile to include the new device. Wait for the build link.

### Step 3 — Install the build on the second iPhone

1. Open the EAS build link on the second iPhone.
2. Tap **Install** and trust the developer profile in:
   `Settings → General → VPN & Device Management`.

### Step 4 — Connect to your dev server

On your development machine:

```bash
# Same Wi-Fi (fastest)
npm run dev

# Different networks / someone in another state on a dev client
npm run dev --tunnel
```

- Scan the QR code with the second iPhone's Camera app.
- Or open the URL shown in the terminal directly in the dev client build.

> The dev client will download the JS bundle from your machine. Keep the dev server running.

---

## Option 2: Test with someone in another state (TestFlight)

Best for external testers. They do **not** need a dev server running and do **not** need to be on your Wi-Fi.

### Step 1 — Build for TestFlight / internal distribution

```bash
eas build --profile preview --platform ios
```

Use `preview` if your `eas.json` is configured for internal distribution, or:

```bash
eas build --profile production --platform ios
```

if you want a real App Store Connect build.

### Step 2 — Add the tester

1. Open [App Store Connect](https://appstoreconnect.apple.com).
2. Go to **Users and Access** → **Testers**.
3. Add the person's email as an **internal tester** (must be a team member) or use **external testing** via TestFlight.

### Step 3 — Share the TestFlight invite

The tester will receive an email or can open the **TestFlight** app on their iPhone and accept the invitation.

### Step 4 — They install and test

They open TestFlight, tap **Install**, and launch the app like a normal App Store app.

> No dev server needed. No UDID registration needed. No signing in/out on your machine.

---

## Option 3: Tunnel mode for a dev client anywhere

If you already have a dev client build on a remote device, you can serve the JS over the internet:

```bash
npm run dev --tunnel
```

- This creates an ngrok URL.
- The remote device opens that URL in the dev client build.
- Your machine must stay on and the dev server must keep running.

Use this for quick remote checks, but TestFlight is better for handing the app to someone else.

---

## Which option should you use?

| Scenario | Recommended approach |
|----------|----------------------|
| Your own second iPhone, same room | Dev client + `npm run dev` |
| Your own second iPhone, different location | Dev client + `npm run dev --tunnel` |
| Friend / family in another state | TestFlight build |
| Long-term beta testers | TestFlight external testing |

---

## Important notes

- **Expo Go will not work.** CometChat's native modules are only included in development builds and TestFlight/App Store builds.
- A development build is tied to your Apple Team and provisioning profile. Adding a new iPhone requires rebuilding.
- TestFlight builds take longer to process (Apple review is not required for internal testing, but processing can take a few minutes).
