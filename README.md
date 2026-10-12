# 📓 Zemenawi Defter (ዘመናዊ ደፍተር)

> **A modern, offline-first digital ledger, inventory management, and POS application tailored for small and medium retail businesses.**

---

## 📖 Overview

**Zemenawi Defter** (meaning *"Modern Ledger"* in Tigrinya and Amharic) bridges the gap between traditional manual paper record-keeping ("ደፍተር") and modern digital retail management. Designed for retail merchants, kiosks, and shop owners in Ethiopia and East Africa, Zemenawi Defter delivers a fast, offline-first experience with native Tigrinya (ትግርኛ) and English localization.

The application allows store owners to manage inventory batches, record cash and credit transactions, track customer credit/debt with FIFO settlement, and view real-time profit and loss reports—all without requiring continuous internet access.

---

## ✨ Key Features

### 📦 Inventory & Batch Management
- **Product Catalog**: Add, edit, and organize products with units and standard selling prices.
- **Batch Tracking & FIFO Costing**: Track purchases by batch with purchase prices and quantities to accurately calculate Cost of Goods Sold (COGS).
- **Stock Indicators**: Real-time stock counts and low-stock warning thresholds.

### 🛒 Point of Sale (POS) & Sales Recording
- **Cash & Credit Transactions**: Record instant cash transactions or issue items on store credit to registered customers.
- **Split / Partial Payments**: Accept upfront partial payments on credit transactions with automatic balance adjustment.
- **Automatic Stock Consumption**: Depletes inventory using First-In-First-Out (FIFO) logic to guarantee accurate profit calculations.

### 💳 Customer Debt & Credit Book (የብድር መዝገብ / መዝገብ ልቃሕ)
- **Customer Profiles**: Store customer contact details and transaction history.
- **Outstanding Balance Tracking**: Immediate visibility of total debt per customer and business-wide receivables.
- **Flexible Debt Settlements**: Supports customer payments applied either directly to specific sale items or automatically allocated via FIFO across oldest outstanding credit sales.
- **Receipt Identifiers**: Automated receipt tracking (`ZD-timestamp-rand`) for payment verification.

### 📊 Financial Reporting & Insights
- **Business Performance Dashboard**: At-a-glance metrics for today's sales, active stock value, and total outstanding debt.
- **Period-Based Reports**: Analyze sales, COGS, and gross profit by day, week, month, or custom date ranges.
- **Item-Level Profit Analysis**: See exactly which products yield the highest profit margins.

### 🌐 Bilingual & Culturally Tailored
- **Dual Language Support**: Seamless toggle between **Tigrinya (ትግርኛ)** and **English**.
- **Ethiopic Typography**: Uses Google's `Noto Sans Ethiopic` font for Ge'ez script rendering alongside `Inter` for Latin characters.

### 📴 Offline-First Architecture
- Powered by **WatermelonDB (SQLite)**: Lightning-fast reads and writes directly on the device with zero network latency.
- Scalable database schema with versioned migrations and relationship modeling.

### 🔐 Authentication & Cloud Integration
- Powered by **Firebase Authentication** and **Cloud Firestore** for secure merchant account registration, login, and cloud subscription/profile sync.

---

## 🛠️ Tech Stack & Libraries

| Category | Technology |
|---|---|
| **Framework** | [React Native 0.81](https://reactnative.dev/) (New Architecture Enabled), [Expo SDK 54](https://expo.dev/) |
| **Routing** | [Expo Router v6](https://docs.expo.dev/router/introduction/) (File-based routing) |
| **Local Database** | [@nozbe/watermelondb](https://watermelondb.dev/) (SQLite engine) |
| **UI Components** | [React Native Paper 5](https://callstack.github.io/react-native-paper/) (Material Design 3), [Expo Vector Icons](https://icons.expo.fyi/) |
| **Internationalization** | `i18n-js`, `react-i18next`, custom `LanguageContext` |
| **Typography** | `@expo-google-fonts/noto-sans-ethiopic`, `@expo-google-fonts/inter` |
| **Cloud & Auth** | `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore` |
| **Animation & Gestures** | `react-native-reanimated`, `react-native-gesture-handler` |

---

## 📁 Project Structure

```plaintext
ZemenawiDefter/
├── app/                      # Expo Router navigation routes & screens
│   ├── (tabs)/               # Bottom tab navigation
│   │   ├── credits/          # Credit list, payment processing & details
│   │   ├── inventory/        # Product list, batch addition, product detail
│   │   ├── sales/            # POS sales screen, sale history & details
│   │   ├── index.jsx         # Home dashboard & quick actions
│   │   └── reports.jsx       # Financial analytics, COGS & profit breakdown
│   ├── auth/                 # Authentication screens (Login, Signup, Forgot Password, Onboarding)
│   ├── settings/             # Database management & language selection
│   ├── _layout.jsx           # Root layout provider (Fonts, Theme, Auth, Language)
│   └── root.jsx              # Auth gatekeeper & initial redirection
├── src/
│   ├── auth/                 # AuthProvider context & session management
│   ├── components/           # Reusable UI components (StatCard, Screen, TabBarIcon, etc.)
│   ├── database/             # WatermelonDB schema, migrations, connection & seed data
│   ├── firebase/             # Firebase SDK config, auth & user services
│   ├── i18n/                 # Localization dictionaries (en.js, ti.js) & LanguageContext
│   ├── models/               # WatermelonDB models (Customer, Product, ProductBatch, Sale, etc.)
│   ├── services/             # Core business services (credit, inventory, sale, reporting)
│   └── theme/                # Material Design themes and dynamic font configs
├── assets/                   # App icons, splash screens, and images
├── app.json                  # Expo project manifest & configuration
├── google-services.json      # Firebase configuration for Android
└── package.json              # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) on your mobile device, or an [Android Studio Emulator](https://docs.expo.dev/workflow/android-studio-emulator/) / physical device with USB debugging enabled.

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Wedi-Nachew/Zemenawi-Defter.git
cd Zemenawi-Defter
npm install
```

### 2. Firebase Configuration

Ensure `google-services.json` is configured in the root directory (matching your Firebase project package name `com.wedi_nachew.zemenawi_defter`).

### 3. Run the Development Server

Start the Expo development server:

```bash
npx expo start
```

Or run directly on an Android device/emulator:

```bash
npm run android
```

### 4. Database Seeding & Testing

To test the application with sample products, batches, sales, and customers:
1. Open the app and navigate to **Settings** (gear icon in the top header).
2. Tap **"Seed Database"** to populate sample inventory and transaction records.
3. You can clear local data at any time by selecting **"Delete Database"**.

---

## 🌐 Localization

Translations are managed in `src/i18n/`:
- `src/i18n/en.js`: English translations
- `src/i18n/ti.js`: Tigrinya (ትግርኛ) translations

To add a new language, create a new locale file in `src/i18n/` and register it inside `src/i18n/index.js` and `LanguageContext.js`.

---

## 📄 License

This project is private and proprietary. All rights reserved.
