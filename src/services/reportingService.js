import database from "../database";

const saleItemCollection = database.collections.get("sale_items");
const productCollection = database.collections.get("products");
const salesCollection = database.collections.get("sales");
const customerCollection = database.collections.get("customers");

// Get total profit per product
const getProfitPerProduct = async () => {
    const products = await productCollection.query().fetch();
    const profitData = [];

    for (const product of products) {
        const items = await product.saleItems.fetch();

        const profit = items.reduce((sum, item) => {
            return sum + (item.sellingPrice - item.costPrice) * item.quantity;
        }, 0);

        profitData.push({
            product,
            profit,
        });
    }

    return profitData;
};

// Get profite within a date range
const getProfitByDateRange = async (startDate, endDate) => {
    const sales = await salesCollection.query().fetch();

    let totalProfit = 0;

    for (const sale of sales) {
        if (sale.soldAt < startDate || sale.soldAt > endDate) continue;

        const items = await sale.saleItems.fetch();
        totalProfit += items.reduce((sum, item) => {
            return sum + (item.sellingPrice - item.costPrice) * item.quantity;
        }, 0);
    }

    return totalProfit;
};

// Get low stock products
const getLowStockProducts = async (threshold = 10) => {
    const products = await productCollection.query().fetch();
    return products.filter((p) => p.stock <= threshold);
};

// Get outstanding balance per customer
const getCustomerOutstandingBalances = async () => {
    const customers = await customerCollection.query().fetch();
    const balances = [];

    for (const customer of customers) {
        const balance = await getSaleItemRemainingBalanceForCustomer(customer);
        balances.push({
            customer,
            balance,
        });
    }

    return balances;
};

// Helper: total remaining balance for a customer
const getSaleItemRemainingBalanceForCustomer = async (customer) => {
    let totalBalance = 0;
    const sales = await customer.sales.fetch();

    for (const sale of sales) {
        if (sale.type !== "credit") continue;
        const items = await sale.saleItems.fetch();
        for (const item of items) {
            // Use @children relation defined in SaleItem model
            const payments = await item.creditPaymentItems.fetch();

            const paid = payments.reduce(
                (sum, p) => sum + (p.amountApplied || 0),
                0,
            );
            const remaining = item.totalPrice - paid;
            totalBalance += Math.max(0, remaining);
        }
    }

    return totalBalance;
};

// Top selling products by quantity
const getTopSellingProducts = async (limit = 10) => {
    const products = await productCollection.query().fetch();
    const productSales = [];

    for (const product of products) {
        const items = await product.saleItems.fetch();
        const totalSold = items.reduce((sum, item) => sum + item.quantity, 0);
        productSales.push({
            product,
            totalSold,
        });
    }

    productSales.sort((a, b) => b.totalSold - a.totalSold);
    return productSales.slice(0, limit);
};

export {
    getCustomerOutstandingBalances,
    getLowStockProducts,
    getProfitByDateRange,
    getProfitPerProduct,
    getTopSellingProducts
};

