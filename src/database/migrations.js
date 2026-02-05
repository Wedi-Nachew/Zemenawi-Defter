import { schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

const migrations = schemaMigrations({
    migrations: [
        {
            toVersion: 3,
            steps: [
                // Add product_batches table
                {
                    type: "create_table",
                    name: "product_batches",
                    columns: [
                        { name: "product_id", type: "string", isIndexed: true },
                        { name: "purchase_price", type: "number" },
                        { name: "quantity", type: "number" },
                        { name: "remaining_quantity", type: "number" },
                        { name: "purchased_at", type: "number" },
                        { name: "created_at", type: "number" },
                        { name: "updated_at", type: "number" },
                    ],
                },

                // Add cost_price column to sale_items table
                {
                    type: "add_columns",
                    table: "sale_items",
                    columns: [
                        {
                            name: "cost_price",
                            type: "number",
                        },
                    ],
                },

                // Remove purchase_price column from products
                {
                    type: "remove_columns",
                    table: "products",
                    columns: ["purchase_price"],
                },
            ],
        },
        {
            toVersion: 4,
            steps: [
                {
                    type: "add_columns",
                    table: "product_batches",
                    columns: [{ name: "unit", type: "string" }],
                },
                {
                    type: "add_columns",
                    table: "sale_items",
                    columns: [{ name: "unit", type: "string" }],
                },
            ],
        },
        {
            toVersion: 5,
            steps: [
                {
                    type: "add_columns",
                    table: "credit_payments",
                    columns: [{ name: "receipt_no", type: "string" }],
                },
            ],
        },
    ],
});

export default migrations;
