# ZemenawiDefter Copilot Instructions

## Big picture architecture

- Expo Router file-based navigation lives under app/ (root stack in app/\_layout.tsx, tabs in app/(tabs)/\_layout.jsx).
- Root layout wires providers: LanguageProvider, SafeAreaProvider, and PaperProvider with the shared theme and Inter fonts (app/\_layout.tsx, src/theme/index.js, src/i18n/LanguageContext.js).
- Data layer is WatermelonDB with SQLite adapter (src/database/index.js, src/database/schema.js); models are defined in src/models/\*.js and registered in src/models/index.js.
- Business logic lives in service modules under src/services/\* and should run DB mutations inside database.write.

## Data flows and domain rules (follow these patterns)

- Inventory is FIFO by batches: addStock creates product_batches and updates Product.stock; consumeStockFIFO runs inside database.write (src/services/inventoryService.js).
- Sale creation consumes FIFO stock, writes sale_items with cost_price, and for credit sales applies initial payment via FIFO allocation (src/services/saleService.js, src/services/creditService.js).
- Credit payments apply oldest unpaid sale items first via getUnpaidSaleItemsFIFO/payGenericFIFO (src/services/creditService.js).
- Product.stock is a cached field; update it only via inventoryService helpers (see updateProduct note in src/services/productService.js).

## UI and state conventions

- Use React Native Paper components and the shared theme; screens typically wrap content in Screen for safe area + padding (src/components/Screen.jsx, src/theme/index.js).
- Tab screens under app/(tabs) currently use local mock data; when wiring real data, replace with WatermelonDB queries/services rather than inline arrays.
- i18n uses i18n-js with expo-localization; default locale is ti and fallback is enabled (src/i18n/index.js).

## Developer workflows

- Install deps: npm install
- Start dev server: npm run start (expo start)
- Platform runs: npm run android | npm run ios | npm run web
- Lint: npm run lint (expo lint)

## External integrations

- Expo Router entrypoint is expo-router/entry in package.json.
- WatermelonDB SQLite adapter uses jsi: false for Expo managed workflow (src/database/index.js).
