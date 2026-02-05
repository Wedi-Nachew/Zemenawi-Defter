import { appSchema, tableSchema } from "@nozbe/watermelondb";

// ZemenawiDefter Database Schema
// Version 3 (adds product_batches + cost_price on sale_items)
// Version 4 (adds unit columns to product_batches and sale_items)
// Version 5 (adds receipt_no to credit_payments)
const schema = appSchema({
    version: 5,
    tables: [
        // Customers
        tableSchema({
            name: "customers",
            columns: [
                { name: "name", type: "string" },
                { name: "phone", type: "string", isOptional: true },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),

        // Products
        tableSchema({
            name: "products",
            columns: [
                { name: "name", type: "string" },
                { name: "default_selling_price", type: "number" },
                { name: "stock", type: "number" }, // cached for performance
                { name: "unit", type: "string" },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),

        // Product Batches
        tableSchema({
            name: "product_batches",
            columns: [
                { name: "product_id", type: "string", isIndexed: true },
                { name: "purchase_price", type: "number" },
                { name: "quantity", type: "number" },
                { name: "remaining_quantity", type: "number" },
                { name: "unit", type: "string" },
                { name: "purchased_at", type: "number" },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),

        // Sales
        tableSchema({
            name: "sales",
            columns: [
                {
                    name: "customer_id",
                    type: "string",
                    isOptional: true,
                    isIndexed: true,
                },
                { name: "type", type: "string" }, // "cash" or "credit"
                { name: "sold_at", type: "number", isIndexed: true }, // timestamp of sale
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),

        // Sale Items
        tableSchema({
            name: "sale_items",
            columns: [
                { name: "sale_id", type: "string", isIndexed: true },
                { name: "product_id", type: "string", isIndexed: true },
                { name: "quantity", type: "number" },
                { name: "unit", type: "string" },
                { name: "selling_price", type: "number" },
                { name: "cost_price", type: "number" }, // FIFO calculated cost price
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),

        // Credit Payments
        tableSchema({
            name: "credit_payments",
            columns: [
                { name: "customer_id", type: "string", isIndexed: true },
                { name: "total_amount", type: "number" },
                { name: "paid_at", type: "number", isIndexed: true }, // timestamp of payment
                { name: "receipt_no", type: "string", isOptional: true },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),

        // Credit payment items
        tableSchema({
            name: "credit_payment_items",
            columns: [
                { name: "credit_payment_id", type: "string", isIndexed: true },
                { name: "sale_item_id", type: "string", isIndexed: true },
                { name: "amount_applied", type: "number" },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),
    ],
});

export default schema;
