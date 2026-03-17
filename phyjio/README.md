# 🩺 PhyJio — Home Physiotherapy Management App

> Specialized management tool for solo physiotherapists who do home visits for bedbound patients.

---

## ✨ Features

- **Patient CRM** — Register patients with photos, ailments, medical history, and referral info
- **Visit Logger** — Live stopwatch timer, session notes, automatic duration calculation
- **WhatsApp Communications** — One-tap pre-filled message templates (delay, absence, charges, bill)
- **Billing Engine** — Generate professional text invoices with itemized visit details
- **Excel Export** — Export all data to `.xlsx` (3 sheets: Patients, Visits, Summary) or `.csv`
- **Offline-First** — Powered by WatermelonDB (SQLite), works 100% without internet
- **PIN/Biometric Lock** — Protect sensitive patient data with 4-digit PIN or fingerprint/Face ID

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React Native 0.75 | Cross-platform mobile framework |
| WatermelonDB 0.27 | Offline-first SQLite ORM |
| Zustand 5 | Lightweight state management |
| React Navigation 6 | Screen routing (Stack + Tabs) |
| XLSX 0.18 | Excel file generation |
| react-native-biometrics | Fingerprint/Face ID auth |
| react-native-share | File sharing |
| react-native-fs | File system access |
| TypeScript 5.5 | Type safety throughout |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary (Deep Teal) | `#008080` |
| Background | `#F7FAFA` |
| Surface | `#FFFFFF` |
| Text Primary | `#1A2E2E` |
| Success | `#2ECC71` |
| Danger | `#E74C3C` |
| Warning | `#F39C12` |
| Button Height | `56px` (one-handed use) |
| Tab Bar Height | `64px` |

---

## 🗂️ Folder Structure

```
phyjio/
├── App.tsx                          # Root entry point
├── package.json
├── tsconfig.json
└── src/
    ├── assets/
    │   ├── fonts/
    │   └── images/
    ├── components/
    │   ├── common/                  # AppButton, AppInput, AppCard, Avatar, LoadingSpinner
    │   ├── dashboard/               # TodayVisitCard, StatsRow
    │   ├── patients/                # PatientListItem, PatientFormFields
    │   └── billing/                 # BillPreviewCard
    ├── database/
    │   ├── index.ts                 # WatermelonDB init (JSI enabled)
    │   ├── schema.ts                # Table schemas
    │   ├── migrations.ts
    │   └── models/                  # Patient, Visit, Note
    ├── navigation/
    │   ├── AppNavigator.tsx         # Root stack + auth guard
    │   ├── MainTabNavigator.tsx     # 5-tab bottom navigation
    │   └── types.ts                 # Navigation param types
    ├── screens/
    │   ├── auth/LockScreen.tsx      # PIN + biometric lock
    │   ├── dashboard/               # Home dashboard with stats
    │   ├── patients/                # List, Detail, Add/Edit
    │   ├── visits/                  # Active visit timer, Visit log
    │   ├── communications/          # WhatsApp quick-comm
    │   └── billing/                 # Billing + bill preview
    ├── services/
    │   ├── whatsappService.ts       # Message builder + sender
    │   ├── billingService.ts        # Bill generation + sharing
    │   ├── excelExportService.ts    # Excel/CSV export
    │   └── authService.ts
    ├── store/
    │   ├── authStore.ts             # PIN auth state (Zustand)
    │   └── visitStore.ts            # Active visit timer state
    ├── theme/
    │   ├── colors.ts
    │   ├── typography.ts
    │   └── spacing.ts
    └── utils/
        ├── dateUtils.ts             # Date formatting, ranges
        ├── formatUtils.ts           # Currency, phone, truncate
        └── permissions.ts           # Camera/storage permissions
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android) or Xcode (for iOS)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Pakoladiya/Phyvisio.git
cd Phyvisio/phyjio

# 2. Install dependencies
npm install

# 3. iOS only — install pods
cd ios && pod install && cd ..

# 4. Run the app
npm run android
# or
npm run ios
```

### WatermelonDB JSI Setup
For best performance, WatermelonDB JSI mode is enabled. Follow the [WatermelonDB native setup guide](https://watermelondb.dev/docs/Installation) for Android/iOS bridging configuration.

---

## 📱 Screens Overview

| Screen | Description |
|---|---|
| Lock Screen | PIN entry with biometric fallback |
| Dashboard | Today's schedule, stats, quick actions |
| Patient List | Search/filter patient roster |
| Patient Detail | Full profile, visit history, action buttons |
| Add/Edit Patient | Registration form with photo upload |
| Active Visit | Live stopwatch timer + session notes |
| Visit Log | All visits with date/status filters |
| Quick Comm | WhatsApp message template sender |
| Billing | Invoice generator + Excel/CSV export |
| Bill Preview | Formatted bill with share/payment actions |

---

## 📸 Screenshots

> _Screenshots coming soon_

---

## 🔒 Privacy & Security

- All patient data is stored **locally on device only**
- Photos are stored as local file URIs — **never uploaded anywhere**
- PIN + Biometric authentication protects access
- No network calls — fully offline

---

## 📄 License

MIT © 2026 PhyJio
