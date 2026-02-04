# ZemenawiDefter Copilot Instructions

## Big picture architecture

- Expo Router file-based navigation lives under app/ (tabs in app/(tabs)/\_layout.jsx, root stack in app/\_layout.tsx).
- UI uses React Native Paper + a shared theme (src/theme/index.js). Most screens wrap content in the shared Screen component for safe area + keyboard-aware scrolling (src/components/Screen.jsx).
- Data layer is WatermelonDB with SQLite adapter (src/database/index.js, src/database/schema.js). Models and relationships are in src/models/\*.js.
- Business logic is in service modules under src/services/\* and operates on WatermelonDB models within database.write transactions.

## Data flows and domain rules (examples to follow)

- Inventory uses FIFO batches: addStock creates product_batches and updates Product.stock; consumeStockFIFO must be called inside database.write (src/services/inventoryService.js).
- Sales creation consumes stock via FIFO, creates sale_items with cost_price, and (if credit) applies initial payment using FIFO allocations (src/services/saleService.js, src/services/creditService.js).
- Credit payments apply oldest unpaid sale items first (FIFO) via getUnpaidSaleItemsFIFO/payGenericFIFO (src/services/creditService.js).
- Product stock is a cached field; update stock only via inventoryService (see updateProduct note in src/services/productService.js).

## Project-specific UI conventions

- Use the shared theme colors and React Native Paper components; most screens import theme from src/theme and wrap content in Screen.
- Current tab screens in app/(tabs) use local mock data via useMemo; when wiring real data, replace with WatermelonDB queries/services rather than inline mock arrays.

## Developer workflows

- Install deps: npm install
- Start dev server: npm run start (expo start)
- Platform runs: npm run android | npm run ios | npm run web
- Lint: npm run lint (expo lint)

## External integrations

- Expo Router for navigation (expo-router/entry in package.json).
- WatermelonDB + SQLite adapter with jsi: false for Expo managed workflow (src/database/index.js).
