# Sales and Transaction Model

<cite>
**Referenced Files in This Document**
- [schema.js](file://src/database/schema.js)
- [Customer.js](file://src/models/Customer.js)
- [README.md](file://README.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the Sales and Transaction Model system implemented in the project. It focuses on the sales table with customer linkage, the sale_items junction table for multi-item sales, and the indexing strategy designed to optimize performance for timestamp and foreign key queries. The documentation also outlines the conceptual workflow for cash and credit sales, revenue calculation, and transaction rollback considerations.

## Project Structure
The project uses WatermelonDB for local database modeling. The schema defines the core tables and indexes, while models define relationships between entities. The current repository snapshot includes the database schema and a customer model with related associations.

```mermaid
graph TB
subgraph "Database Layer"
SCHEMA["Schema Definition<br/>src/database/schema.js"]
CUSTOMERS["Table: customers"]
PRODUCTS["Table: products"]
SALES["Table: sales"]
SALE_ITEMS["Table: sale_items"]
CREDIT_PAYMENTS["Table: credit_payments"]
CREDIT_PAYMENT_ITEMS["Table: credit_payment_items"]
end
subgraph "Model Layer"
MODEL_CUSTOMER["Model: Customer<br/>src/models/Customer.js"]
end
SCHEMA --> CUSTOMERS
SCHEMA --> PRODUCTS
SCHEMA --> SALES
SCHEMA --> SALE_ITEMS
SCHEMA --> CREDIT_PAYMENTS
SCHEMA --> CREDIT_PAYMENT_ITEMS
MODEL_CUSTOMER --> CUSTOMERS
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L1-L90)
- [Customer.js](file://src/models/Customer.js#L1-L20)

**Section sources**
- [schema.js](file://src/database/schema.js#L1-L90)
- [Customer.js](file://src/models/Customer.js#L1-L20)
- [README.md](file://README.md#L1-L51)

## Core Components
This section documents the primary tables and their roles in the sales and transaction system.

- Sales table
  - Purpose: Records individual sales transactions.
  - Key fields:
    - customer_id: Foreign key to customers (indexed).
    - type: Transaction type ("cash" or "credit").
    - sold_at: Timestamp of sale (indexed).
    - created_at and updated_at: Consistency timestamps.
  - Notes: customer_id is optional to support walk-in or anonymous sales.

- Sale Items junction table
  - Purpose: Links sales to products and captures per-item details.
  - Key fields:
    - sale_id: Foreign key to sales (indexed).
    - product_id: Foreign key to products (indexed).
    - quantity: Number of units sold.
    - selling_price: Price per unit at time of sale.
    - created_at and updated_at: Consistency timestamps.

- Credit Payments and Credit Payment Items
  - Purpose: Track payments applied against credit sales and link payments to specific sale items.
  - Fields include indexed foreign keys and timestamps for efficient querying.

**Section sources**
- [schema.js](file://src/database/schema.js#L33-L61)
- [schema.js](file://src/database/schema.js#L63-L85)

## Architecture Overview
The sales transaction architecture centers around the sales table and the sale_items junction table. The Customer model exposes relationships to sales and credit payments, enabling navigation from customer to their purchase history and outstanding balances.

```mermaid
classDiagram
class Customer {
+string name
+string phone
+number created_at
+number updated_at
+sales()
+creditPayments()
}
class Sales {
+string customer_id
+string type
+number sold_at
+number created_at
+number updated_at
}
class SaleItems {
+string sale_id
+string product_id
+number quantity
+number selling_price
+number created_at
+number updated_at
}
class Products {
+string name
+number purchase_price
+number default_selling_price
+number stock
+string unit
+number created_at
+number updated_at
}
class CreditPayments {
+string customer_id
+number total_amount
+number paid_at
+number created_at
+number updated_at
}
class CreditPaymentItems {
+string credit_payment_id
+string sale_item_id
+number amount_applied
+number created_at
+number updated_at
}
Customer "1" --> "*" Sales : "has many"
Sales "1" --> "*" SaleItems : "contains"
Products "1" --> "*" SaleItems : "linked via product_id"
Customer "1" --> "*" CreditPayments : "has many"
CreditPayments "1" --> "*" CreditPaymentItems : "links to"
CreditPaymentItems "1" --> "*" SaleItems : "applies to"
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L8-L85)
- [Customer.js](file://src/models/Customer.js#L4-L17)

## Detailed Component Analysis

### Sales Table
- Purpose: Capture each sale event with customer association, transaction type, and timing.
- Indexing strategy:
  - customer_id is indexed to accelerate joins and filtering by customer.
  - sold_at is indexed to support chronological queries and reporting.
- Optional customer_id enables walk-in sales without requiring a customer record.

```mermaid
flowchart TD
Start(["Create Sale"]) --> SetType["Set type to 'cash' or 'credit'"]
SetType --> SetTimestamp["Set sold_at to current timestamp"]
SetTimestamp --> OptionalCustomer{"Has customer?"}
OptionalCustomer --> |Yes| LinkCustomer["Link customer_id"]
OptionalCustomer --> |No| NoCustomer["Leave customer_id null"]
LinkCustomer --> SaveSale["Persist sale record"]
NoCustomer --> SaveSale
SaveSale --> End(["Sale Ready"])
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L33-L48)

**Section sources**
- [schema.js](file://src/database/schema.js#L33-L48)

### Sale Items Junction Table
- Purpose: Store per-item details for a sale, including quantity and selling price.
- Indexing strategy:
  - sale_id is indexed to efficiently fetch all items in a sale.
  - product_id is indexed to quickly locate items for a given product.
- Multi-item sales: Multiple rows in sale_items correspond to a single sale_id.

```mermaid
sequenceDiagram
participant Client as "Client"
participant DB as "Database"
Client->>DB : Insert sale row (sales)
DB-->>Client : Return sale_id
Client->>DB : Insert sale_items rows (multiple items)
DB-->>Client : Confirm all items saved
Client-->>DB : Query sale with items (join sales + sale_items)
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L50-L61)

**Section sources**
- [schema.js](file://src/database/schema.js#L50-L61)

### Cash vs Credit Sale Handling
- Cash sale:
  - Mark type as "cash".
  - Record sold_at timestamp.
  - Persist immediately; no immediate credit balance.
- Credit sale:
  - Mark type as "credit".
  - Persist sale and sale_items.
  - Track customer credit balance via credit_payments and credit_payment_items.

```mermaid
flowchart TD
Start(["New Sale"]) --> Type{"Cash or Credit?"}
Type --> |Cash| CashPath["Record sale with type='cash'<br/>sold_at timestamp"]
Type --> |Credit| CreditPath["Record sale with type='credit'<br/>sold_at timestamp"]
CashPath --> RevenueCalc["Revenue = sum(quantity * selling_price)<br/>per item"]
CreditPath --> CreditTracking["Track customer credit balance<br/>via credit_payments and credit_payment_items"]
RevenueCalc --> End(["Complete"])
CreditTracking --> End
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L43-L44)
- [schema.js](file://src/database/schema.js#L63-L85)

**Section sources**
- [schema.js](file://src/database/schema.js#L43-L44)
- [schema.js](file://src/database/schema.js#L63-L85)

### Revenue Calculation
- Total sale value: Sum of (quantity × selling_price) for all items in a sale.
- This calculation is performed client-side after retrieving sale and sale_items records.

```mermaid
flowchart TD
Start(["Retrieve Sale Items"]) --> Sum["For each item:<br/>value = quantity × selling_price"]
Sum --> Add["Accumulate total revenue"]
Add --> End(["Report Revenue"])
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L56-L57)
- [schema.js](file://src/database/schema.js#L50-L61)

**Section sources**
- [schema.js](file://src/database/schema.js#L50-L61)

### Transaction Rollback Scenarios
- Conceptual guidance:
  - Use a transaction wrapper to group sale and sale_items inserts.
  - On failure, roll back the entire set of inserts to maintain consistency.
  - Ensure rollback handles partial failures (e.g., sale insert succeeds but sale_items fail).
- Implementation note: The schema and model files demonstrate the data model; transaction semantics are typically handled by the database layer (WatermelonDB) during batch operations.

```mermaid
sequenceDiagram
participant App as "Application"
participant DB as "Database"
App->>DB : Begin transaction
App->>DB : Insert sale
App->>DB : Insert sale_items (loop)
DB-->>App : Success or Error
alt Success
App->>DB : Commit
else Error
App->>DB : Rollback
end
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L33-L61)

**Section sources**
- [schema.js](file://src/database/schema.js#L33-L61)

### Multi-Item Sales Example
- Steps:
  - Create a sale row with type and sold_at.
  - Insert multiple sale_items rows with the same sale_id but different product_id values.
  - Calculate revenue as the sum of (quantity × selling_price) across all items.

```mermaid
sequenceDiagram
participant Client as "Client"
participant DB as "Database"
Client->>DB : Insert sale (type='cash', sold_at=timestamp)
DB-->>Client : sale_id
Client->>DB : Insert item 1 (sale_id, product_id A, quantity X, price P1)
Client->>DB : Insert item 2 (sale_id, product_id B, quantity Y, price P2)
Client->>DB : Insert item N (sale_id, product_id Z, quantity Z, price PN)
DB-->>Client : Confirm all items persisted
Client-->>DB : Query sale + items to compute revenue
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L33-L61)

**Section sources**
- [schema.js](file://src/database/schema.js#L33-L61)

## Dependency Analysis
This section maps the relationships among tables and models.

```mermaid
erDiagram
CUSTOMERS {
string id PK
string name
string phone
number created_at
number updated_at
}
SALES {
string id PK
string customer_id FK
string type
number sold_at
number created_at
number updated_at
}
SALE_ITEMS {
string id PK
string sale_id FK
string product_id FK
number quantity
number selling_price
number created_at
number updated_at
}
PRODUCTS {
string id PK
string name
number purchase_price
number default_selling_price
number stock
string unit
number created_at
number updated_at
}
CREDIT_PAYMENTS {
string id PK
string customer_id FK
number total_amount
number paid_at
number created_at
number updated_at
}
CREDIT_PAYMENT_ITEMS {
string id PK
string credit_payment_id FK
string sale_item_id FK
number amount_applied
number created_at
number updated_at
}
CUSTOMERS ||--o{ SALES : "has many"
SALES ||--o{ SALE_ITEMS : "contains"
PRODUCTS ||--o{ SALE_ITEMS : "linked via product_id"
CUSTOMERS ||--o{ CREDIT_PAYMENTS : "has many"
CREDIT_PAYMENTS ||--o{ CREDIT_PAYMENT_ITEMS : "links to"
CREDIT_PAYMENT_ITEMS ||--o{ SALE_ITEMS : "applies to"
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L8-L85)
- [Customer.js](file://src/models/Customer.js#L4-L17)

**Section sources**
- [schema.js](file://src/database/schema.js#L8-L85)
- [Customer.js](file://src/models/Customer.js#L4-L17)

## Performance Considerations
Indexing strategy rationale:
- sales.customer_id is indexed to speed up customer-specific queries and joins.
- sales.sold_at is indexed to optimize chronological reports and range queries.
- sale_items.sale_id is indexed to efficiently fetch all items in a sale.
- sale_items.product_id is indexed to quickly locate items for a given product.
- Additional indexed fields (e.g., credit_payments.customer_id, credit_payments.paid_at, credit_payment_items.credit_payment_id, credit_payment_items.sale_item_id) support efficient credit payment tracking and reconciliation.

These indexes collectively improve query performance for:
- Retrieving a customer's sales history.
- Generating daily/weekly/monthly sales reports.
- Looking up items for a specific product.
- Tracking credit payments and applying them to sale items.

**Section sources**
- [schema.js](file://src/database/schema.js#L38-L44)
- [schema.js](file://src/database/schema.js#L54-L55)
- [schema.js](file://src/database/schema.js#L67-L69)
- [schema.js](file://src/database/schema.js#L79-L80)

## Troubleshooting Guide
Common issues and resolutions:
- Missing indexes causing slow queries:
  - Verify that customer_id, sold_at, sale_id, product_id, customer_id (credit_payments), paid_at (credit_payments), credit_payment_id, and sale_item_id (credit_payment_items) are indexed as defined in the schema.
- Incorrect revenue totals:
  - Ensure all sale_items rows are inserted for a sale and that revenue is calculated as the sum of (quantity × selling_price).
- Data inconsistency after errors:
  - Wrap sale and sale_items inserts in a transaction and roll back on failure to prevent partial writes.

**Section sources**
- [schema.js](file://src/database/schema.js#L38-L44)
- [schema.js](file://src/database/schema.js#L54-L55)
- [schema.js](file://src/database/schema.js#L67-L69)
- [schema.js](file://src/database/schema.js#L79-L80)

## Conclusion
The Sales and Transaction Model leverages a clean relational design with targeted indexes to support fast queries and reliable reporting. The sales table captures essential transaction metadata, while the sale_items junction table enables flexible multi-item sales. Cash and credit flows are supported conceptually through the type field and credit payment tables. Proper indexing and transactional integrity ensure performance and data consistency across typical retail operations.