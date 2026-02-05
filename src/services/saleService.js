import { Q } from "@nozbe/watermelondb";
import database from "../database";
import { payGenericFIFO } from "./creditService";
import { consumeStockFIFO } from "./inventoryService";

const saleCollection = database.collections.get("sales");
const saleItemCollection = database.collections.get("sale_items");

// Create a sale with multiple items
/**
 * items = [
 *  { product, quantity, sellingPrice },
 * ]
 *
 * initialPayment (optional): Amount paid upfront for credit sales
 * - If provided with type="credit", creates a mixed payment sale
 * - The payment is applied using FIFO to the sale items
 */

const createSale = async (
    customer = null,
    type,
    items,
    soldAt = Date.now(),
    initialPayment = null,
) => {
    if (!items || items.length === 0) {
        throw new Error("At least one sale item is required to create a sale.");
    }

    if (type !== "cash" && type !== "credit") {
        throw new Error("Sale type must be either 'cash' or 'credit'.");
    }

    // Validate initialPayment
    if (initialPayment !== null) {
        if (type !== "credit") {
            throw new Error(
                "Initial payment is only valid for credit sales. Use type 'cash' for full payment.",
            );
        }
        if (initialPayment <= 0) {
            throw new Error("Initial payment must be greater than zero.");
        }
        if (!customer) {
            throw new Error(
                "Customer is required for credit sales with initial payment.",
            );
        }
    }

    // Calculate total sale amount for validation
    const totalSaleAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.sellingPrice,
        0,
    );

    if (initialPayment !== null && initialPayment >= totalSaleAmount) {
        throw new Error(
            `Initial payment (${initialPayment}) must be less than total (${totalSaleAmount}). Use type 'cash' for full payment.`,
        );
    }

    const sale = await database.write(async () => {
        // 1. Create the sale record
        const newSale = await saleCollection.create((s) => {
            if (customer) {
                s.customer.set(customer);
            }
            s.type = type;
            s.soldAt = soldAt;
            s.updatedAt = Date.now();
        });

        // 2. Create sale items and associate them with the sale
        for (const item of items) {
            const { product, quantity, sellingPrice } = item;

            if (!product) {
                throw new Error("Sale item must include a product.");
            }

            if (quantity <= 0) {
                throw new Error("Quantity must be greater than zero.");
            }

            if (sellingPrice <= 0) {
                throw new Error("Selling price must be greater than zero.");
            }

            // 3. FIFO stock consumption
            // consumeStockFIFO must be called within this write
            const totalCost = await consumeStockFIFO(product, quantity);

            const costPricePerUnit = totalCost / quantity;

            await saleItemCollection.create((si) => {
                si.sale.set(newSale);
                si.product.set(product);
                si.quantity = quantity;
                si.sellingPrice = sellingPrice;
                si.costPrice = costPricePerUnit;
                si.updatedAt = Date.now();
            });
        }

        return newSale;
    });

    // 4. Apply initial payment if provided (outside the main write transaction)
    if (initialPayment !== null && initialPayment > 0) {
        await payGenericFIFO(customer, initialPayment, soldAt);
    }

    return sale;
};

const getSalesQuery = ({ type = "all", startDate, endDate } = {}) => {
    const clauses = [];

    if (type === "cash" || type === "credit") {
        clauses.push(Q.where("type", type));
    }

    if (startDate !== undefined) {
        clauses.push(Q.where("sold_at", Q.gte(startDate)));
    }

    if (endDate !== undefined) {
        clauses.push(Q.where("sold_at", Q.lte(endDate)));
    }

    return saleCollection.query(...clauses, Q.sortBy("sold_at", Q.desc));
};

const getSales = async ({ search = "", ...options } = {}) => {
    const sales = await getSalesQuery(options).fetch();
    if (!search) return sales;

    const normalized = search.trim().toLowerCase();
    const filtered = [];
    for (const sale of sales) {
        if (!sale.customerId) {
            filtered.push(sale);
            continue;
        }
        const customer = await sale.customer.fetch();
        if (customer?.name?.toLowerCase().includes(normalized)) {
            filtered.push(sale);
        }
    }

    return filtered;
};

const getRecentSales = async (limit = 5) => {
    return await saleCollection
        .query(Q.sortBy("sold_at", Q.desc), Q.take(limit))
        .fetch();
};

const getSaleById = async (id) => {
    return await saleCollection.find(id);
};

const getSaleItems = async (saleId) => {
    return await saleItemCollection.query(Q.where("sale_id", saleId)).fetch();
};

const deleteSale = async (saleId) => {
    return await database.write(async () => {
        const sale = await saleCollection.find(saleId);
        const items = await getSaleItems(saleId);

        for (const item of items) {
            await item.markAsDeleted();
        }

        await sale.markAsDeleted();
    });
};

export {
    createSale,
    deleteSale,
    getRecentSales,
    getSaleById,
    getSaleItems,
    getSales,
    getSalesQuery,
};
