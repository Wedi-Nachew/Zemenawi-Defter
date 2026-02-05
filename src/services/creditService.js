import { Q } from "@nozbe/watermelondb";
import database from "../database";

const creditPaymentsCollection = database.collections.get("credit_payments");
const creditPaymentItemsCollection = database.collections.get(
    "credit_payment_items",
);
const customerCollection = database.collections.get("customers");

const generateReceiptNo = () => {
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
    return `ZD-${timestamp}-${rand}`;
};

/**
 * Pay toward specific credit sale items
 *
 * items = [
 *  {
 *      saleItem,
 *      amount
 *  }
 * ]
 */

const payTowardSaleItems = async (customer, items, paidAt = Date.now()) => {
    if (!items || items.length === 0) {
        throw new Error(
            "At least one sale item must be specified to make a credit payment.",
        );
    }

    for (const { amount } of items) {
        if (amount <= 0) {
            throw new Error("Payment amounts must be greater than zero.");
        }
    }

    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

    return database.write(async () => {
        const receiptNo = generateReceiptNo();
        // 1. Create the credit payment record
        const payment = await creditPaymentsCollection.create((p) => {
            p.customer.set(customer);
            p.totalAmount = totalAmount;
            p.paidAt = paidAt;
            p.receiptNo = receiptNo;
            p.updatedAt = Date.now();
        });

        // 2. Apply payments toward sale items
        for (const { saleItem, amount } of items) {
            const remaining = await getSaleItemRemainingBalance(saleItem);

            if (amount > remaining) {
                throw new Error(
                    `Payment amount ${amount} exceeds remaining balance ${remaining} for sale item ID ${saleItem.id}`,
                );
            }

            await creditPaymentItemsCollection.create((cpi) => {
                cpi.creditPayment.set(payment);
                cpi.saleItem.set(saleItem);
                cpi.amountApplied = amount;
                cpi.updatedAt = Date.now();
            });
        }

        return payment;
    });
};

const getSaleItemRemainingBalance = async (saleItem) => {
    // Fetch all credit payment items linked to this sale item using @children relation
    const payments = await saleItem.creditPaymentItems.fetch();

    const paid = payments.reduce((sum, p) => sum + p.amountApplied, 0);
    const total = saleItem.sellingPrice * saleItem.quantity;

    return total - paid;
};

const getCustomerTotalCreditBalance = async (customer) => {
    const sales = await customer.sales.fetch();
    let totalBalance = 0;

    for (const sale of sales) {
        if (sale.type !== "credit") continue;

        const items = await sale.saleItems.fetch();
        for (const item of items) {
            totalBalance += await getSaleItemRemainingBalance(item);
        }
    }

    return totalBalance;
};

/**
 * Get all unpaid sale items for a customer, sorted by sale date (FIFO - oldest first)
 * Returns array of { saleItem, sale, remainingBalance }
 */
const getUnpaidSaleItemsFIFO = async (customer) => {
    const sales = await customer.sales.fetch();
    const unpaidItems = [];

    for (const sale of sales) {
        if (sale.type !== "credit") continue;

        const items = await sale.saleItems.fetch();
        for (const item of items) {
            const remainingBalance = await getSaleItemRemainingBalance(item);
            if (remainingBalance > 0) {
                unpaidItems.push({
                    saleItem: item,
                    sale,
                    remainingBalance,
                });
            }
        }
    }

    // Sort by sale date (oldest first = FIFO)
    unpaidItems.sort((a, b) => (a.sale.soldAt || 0) - (b.sale.soldAt || 0));

    return unpaidItems;
};

/**
 * Apply a generic payment using FIFO - oldest unpaid items get paid first
 * Use this when customer pays without specifying which items
 */
const payGenericFIFO = async (customer, amount, paidAt = Date.now()) => {
    if (amount <= 0) {
        throw new Error("Payment amount must be greater than zero.");
    }

    const totalOwed = await getCustomerTotalCreditBalance(customer);
    if (amount > totalOwed) {
        throw new Error(
            `Payment amount ${amount} exceeds total balance ${totalOwed}.`,
        );
    }

    const unpaidItems = await getUnpaidSaleItemsFIFO(customer);

    // Build payment allocations
    let remainingPayment = amount;
    const allocations = [];

    for (const { saleItem, remainingBalance } of unpaidItems) {
        if (remainingPayment <= 0) break;

        const amountToApply = Math.min(remainingBalance, remainingPayment);
        allocations.push({ saleItem, amount: amountToApply });
        remainingPayment -= amountToApply;
    }

    // Use existing payTowardSaleItems to create payment record
    return await payTowardSaleItems(customer, allocations, paidAt);
};

const getCustomersQuery = () => {
    return customerCollection.query(Q.sortBy("name", Q.asc));
};

const getCustomersWithBalances = async ({
    search = "",
    filter = "all",
} = {}) => {
    const customers = await getCustomersQuery().fetch();
    const normalized = search.trim().toLowerCase();
    const results = [];

    for (const customer of customers) {
        if (normalized) {
            const matchesName = customer.name
                ?.toLowerCase()
                .includes(normalized);
            const matchesPhone = customer.phone?.includes(normalized);
            if (!matchesName && !matchesPhone) continue;
        }

        const balance = await getCustomerTotalCreditBalance(customer);

        if (filter === "balance" && balance <= 0) continue;
        if (filter === "paid" && balance > 0) continue;

        results.push({ customer, balance });
    }

    return results;
};

const getCustomerById = async (id) => {
    return await customerCollection.find(id);
};

const getCustomerPayments = async (customerId, limit = 20) => {
    return await creditPaymentsCollection
        .query(
            Q.where("customer_id", customerId),
            Q.sortBy("paid_at", Q.desc),
            Q.take(limit),
        )
        .fetch();
};

const getCustomerUnpaidItems = async (customer) => {
    return await getUnpaidSaleItemsFIFO(customer);
};

export {
    getCustomerById,
    getCustomerPayments,
    getCustomersQuery,
    getCustomersWithBalances,
    getCustomerTotalCreditBalance,
    getCustomerUnpaidItems,
    getSaleItemRemainingBalance,
    getUnpaidSaleItemsFIFO,
    payGenericFIFO,
    payTowardSaleItems,
};
