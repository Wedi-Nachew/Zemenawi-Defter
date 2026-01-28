# Credit Payment and Receivables Model

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
This document explains the Credit Payments model system implemented in the project. It focuses on the database schema for credit payments, the relationship between credit payments and the sales system, and the mechanics of payment application against specific sale items. The goal is to help both technical and non-technical readers understand how customer receivables are tracked, how payments are applied, and how outstanding balances are calculated.

## Project Structure
The credit payment system is defined in the WatermelonDB schema and integrates with the existing sales and customer models. The schema defines:
- A customers table with basic contact and audit fields
- A sales table that records transactions and links to customers
- A sale_items table that captures per-item details for each sale
- A credit_payments table that records cash received from customers for credit purchases
- A credit_payment_items table that links payments to specific sale items and tracks the amount applied

```mermaid
graph TB
subgraph "Database Schema"
CUSTOMERS["customers<br/>Fields: name, phone, created_at, updated_at"]
SALES["sales<br/>Fields: customer_id, type, sold_at, created_at, updated_at"]
SALE_ITEMS["sale_items<br/>Fields: sale_id, product_id, quantity, selling_price, created_at, updated_at"]
CREDIT_PAYMENTS["credit_payments<br/>Fields: customer_id, total_amount, paid_at, created_at, updated_at"]
CREDIT_PAYMENT_ITEMS["credit_payment_items<br/>Fields: credit_payment_id, sale_item_id, amount_applied, created_at, updated_at"]
end
CUSTOMERS <-- "FK: customer_id" --> SALES
SALES <-- "FK: sale_id" --> SALE_ITEMS
CUSTOMERS <-- "FK: customer_id" --> CREDIT_PAYMENTS
CREDIT_PAYMENTS <-- "FK: credit_payment_id" --> CREDIT_PAYMENT_ITEMS
SALE_ITEMS <-- "FK: sale_item_id" --> CREDIT_PAYMENT_ITEMS
```

**Diagram sources**
- [schema.js](file://src/database/schema.js#L8-L85)

**Section sources**
- [schema.js](file://src/database/schema.js#L1-L90)
- [README.md](file://README.md#L1-L51)

## Core Components
This section documents the two primary tables involved in credit payments and receivables:

- credit_payments
  - Purpose: Records cash receipts from customers for credit sales
  - Key fields:
    - customer_id: Foreign key to customers
    - total_amount: Total payment amount
    - paid_at: Timestamp of payment
    - created_at, updated_at: Audit timestamps
  - Indexes: customer_id, paid_at

- credit_payment_items
  - Purpose: Links payments to specific sale items and tracks how much was applied
  - Key fields:
    - credit_payment_id: Foreign key to credit_payments
    - sale_item_id: Foreign key to sale_items
    - amount_applied: Amount allocated to this sale item
    - created_at, updated_at: Audit timestamps
  - Indexes: credit_payment_id, sale_item_id

These tables enable:
- Tracking which customer paid how much and when
- Applying payments to specific sale items
- Calculating outstanding balances by comparing sale item amounts to applied amounts

**Section sources**
- [schema.js](file://src/database/schema.js#L63-L85)

## Architecture Overview
The credit payment workflow connects the sales system with the payment application logic:

```mermaid
sequenceDiagram
participant Customer as "Customer"
participant SalesSystem as "Sales System"
participant Payment as "Credit Payment"
participant Allocation as "Allocation Engine"
Customer->>SalesSystem : "Make credit purchase"
SalesSystem-->>Customer : "Sale recorded (unpaid)"
Customer->>Payment : "Make payment"
Payment->>Allocation : "Submit payment with amount"
Allocation->>SalesSystem : "Fetch unpaid sale items"
Allocation->>Allocation : "Apply payment to items (partial or full)"
Allocation-->>Payment : "Link applied amounts to sale items"
Payment-->>Customer : "Confirmation (payment recorded)"
```

This sequence illustrates:
- Credit purchases create sale items with outstanding amounts
- Payments are recorded in credit_payments
- The allocation engine applies payment amounts to specific sale items via credit_payment_items
- Outstanding balances are derived from remaining unpaid portions of sale items

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

## Detailed Component Analysis

### Credit Payments Table
The credit_payments table stores payment metadata and enables customer-level aggregation of receivable collections.

```mermaid
erDiagram
CREDIT_PAYMENTS {
string id PK
string customer_id FK
number total_amount
number paid_at
number created_at
number updated_at
}
```

- Relationships:
  - One-to-many with credit_payment_items (via credit_payment_id)
  - Many-to-one with customers (via customer_id)

- Use cases:
  - Track total payment amounts per customer
  - Filter payments by date range using paid_at
  - Reconcile customer accounts by summing applied amounts

**Section sources**
- [schema.js](file://src/database/schema.js#L63-L73)

### Credit Payment Items Junction Table
The credit_payment_items table is the core of payment allocation, linking payments to specific sale items.

```mermaid
erDiagram
CREDIT_PAYMENT_ITEMS {
string id PK
string credit_payment_id FK
string sale_item_id FK
number amount_applied
number created_at
number updated_at
}
CREDIT_PAYMENTS ||--o{ CREDIT_PAYMENT_ITEMS : "applies_to"
SALE_ITEMS ||--o{ CREDIT_PAYMENT_ITEMS : "receives_payment"
```

- Allocation logic:
  - amount_applied is the portion of the payment attributed to a specific sale_item_id
  - Multiple credit_payment_items can reference the same sale_item_id (multiple payments to one item)
  - Multiple sale_item_ids can be linked to the same credit_payment_id (single payment covering multiple items)

- Outstanding balance calculation:
  - Sum all amount_applied for each sale_item_id
  - Compare to the original sale item amount (quantity × selling_price)
  - Remaining unpaid amount = sale item amount - sum of applied amounts

**Section sources**
- [schema.js](file://src/database/schema.js#L75-L85)

### Relationship to Sales System
Credit payments are tightly coupled to the sales system:

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
string product_id
number quantity
number selling_price
number created_at
number updated_at
}
CUSTOMERS ||--o{ SALES : "has_many"
SALES ||--o{ SALE_ITEMS : "has_many"
```

- Credit purchases:
  - A sale with type indicating credit creates sale_items with unpaid amounts
  - These items represent the customer's receivable

- Payment application:
  - Payments are recorded in credit_payments
  - credit_payment_items link payment amounts to specific sale_items
  - This maintains auditability and supports partial payments

**Section sources**
- [schema.js](file://src/database/schema.js#L33-L61)
- [schema.js](file://src/database/schema.js#L63-L85)

### Payment Application Examples

#### Example 1: Partial payment to a single sale item
- Scenario: A sale item amount is 1000. A payment of 400 is applied.
- Outcome:
  - Create one credit_payment record with total_amount = 400 and paid_at timestamp
  - Create one credit_payment_items record with amount_applied = 400 linking to the specific sale_item_id
  - Outstanding balance for that item remains 600

#### Example 2: Single payment applied to multiple sale items
- Scenario: A payment of 700 is applied across two sale items with amounts 300 and 500.
- Outcome:
  - Create one credit_payment record with total_amount = 700
  - Create two credit_payment_items records:
    - First with amount_applied = 300
    - Second with amount_applied = 400 (partial application to second item)
  - Outstanding balances: 0 and 100 respectively

#### Example 3: Multiple payments to the same sale item
- Scenario: A sale item amount is 200. Two payments apply 80 and 120 respectively.
- Outcome:
  - Create two credit_payment records (or one with total_amount = 200)
  - Create two credit_payment_items pointing to the same sale_item_id with amount_applied = 80 and 120
  - Outstanding balance: 0

[No sources needed since this section provides conceptual examples]

### Outstanding Balance Calculation
Outstanding balances are computed per sale item:

```mermaid
flowchart TD
Start(["Start"]) --> FetchItems["Fetch all sale_items for the customer"]
FetchItems --> SumApplied["Sum amount_applied per sale_item_id"]
SumApplied --> CalcRemaining["remaining = item.amount - sum(applied)"]
CalcRemaining --> Status{"remaining > 0?"}
Status --> |Yes| MarkUnpaid["Mark as unpaid"]
Status --> |No| MarkPaid["Mark as fully paid"]
MarkUnpaid --> End(["End"])
MarkPaid --> End
```

- Unpaid items require follow-up collection
- Fully paid items can be closed in reporting
- Partially paid items show remaining balance for future allocations

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

### Credit Account Reconciliation
Reconciliation ties together payments and receivables:

```mermaid
flowchart TD
PStart(["Payment Reconciliation"]) --> LoadPayments["Load credit_payments for period"]
LoadPayments --> LoadAllocations["Load credit_payment_items for period"]
LoadAllocations --> GroupByCustomer["Group by customer_id"]
GroupByCustomer --> SumCustomerPayments["Sum total_amount per customer"]
SumCustomerPayments --> CompareWithReceivables["Compare with receivable totals from sales"]
CompareWithReceivables --> Discrepancy{"Balances match?"}
Discrepancy --> |Yes| ReportOK["Report reconciled"]
Discrepancy --> |No| Investigate["Investigate discrepancies"]
Investigate --> Adjustments["Apply adjustments or corrections"]
Adjustments --> ReportOK
```

- Periodic reconciliation ensures financial accuracy
- Discrepancies often arise from missing allocations or incorrect amounts
- Historical audit trails (created_at, updated_at) support dispute resolution

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

## Dependency Analysis
The credit payment system depends on the sales and customer models:

```mermaid
graph LR
CUSTOMER_MODEL["Customer Model"] --> SCHEMA["Database Schema"]
SCHEMA --> CREDIT_PAYMENTS["credit_payments"]
SCHEMA --> CREDIT_PAYMENT_ITEMS["credit_payment_items"]
SCHEMA --> SALES["sales"]
SCHEMA --> SALE_ITEMS["sale_items"]
CREDIT_PAYMENTS --> CUSTOMER_MODEL
CREDIT_PAYMENT_ITEMS --> SALE_ITEMS
CREDIT_PAYMENT_ITEMS --> CREDIT_PAYMENTS
```

- Cohesion: Payment logic is encapsulated in the schema and related models
- Coupling: credit_payment_items depends on both credit_payments and sale_items
- External dependencies: WatermelonDB decorators and model relations

**Section sources**
- [schema.js](file://src/database/schema.js#L63-L85)
- [Customer.js](file://src/models/Customer.js#L1-L20)

## Performance Considerations
- Indexes: customer_id and paid_at in credit_payments; credit_payment_id and sale_item_id in credit_payment_items improve query performance for common filters and joins
- Audit fields: created_at and updated_at enable efficient change tracking and incremental sync
- Allocation granularity: Using per-sale-item allocations allows precise balance tracking without recalculating entire sale amounts

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Mismatched totals: Verify that sum(amount_applied) does not exceed sale item amount
- Missing allocations: Ensure every payment has corresponding credit_payment_items entries
- Duplicate payments: Use paid_at and customer_id to deduplicate and reconcile
- Audit trail: Use created_at and updated_at to track changes and resolve disputes

**Section sources**
- [schema.js](file://src/database/schema.js#L63-L85)

## Conclusion
The credit payment and receivables model provides a robust foundation for managing customer receivables and payment applications. By linking payments to specific sale items and maintaining audit trails, the system supports accurate outstanding balance calculations, flexible partial payments, and reliable reconciliation. The schema design leverages WatermelonDB’s indexing and relation capabilities to keep queries efficient while preserving data integrity.