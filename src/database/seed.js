import database from "./index";

const seedDB = async () => {
    const now = new Date();

    await database.write(async () => {
        console.log("Seeding database...");

        const customers = database.collections.get("customers");
        const products = database.collections.get("products");
        const batches = database.collections.get("product_batches");
        const sales = database.collections.get("sales");
        const saleItems = database.collections.get("sale_items");
        const payments = database.collections.get("credit_payments");
        const paymentItems = database.collections.get("credit_payment_items");

        // Customers
        const customer1 = await customers.create((cust) => {
            cust.name = "Abel Tadesse";
            cust.phone = "0912345678";
            cust.created_at = now;
            cust.updated_at = now;
        });

        const customer2 = await customers.create((cust) => {
            cust.name = "Mulugeta Kebede";
            cust.phone = "0987654321";
            cust.created_at = now;
            cust.updated_at = now;
        });

        // Products
        // ======================
        // Products
        // ======================
        const sugar = await products.create((p) => {
            p.name = "Sugar";
            p.default_selling_price = 65;
            p.stock = 150;
            p.unit = "kg";
            p.created_at = now;
            p.updated_at = now;
        });

        const rice = await products.create((p) => {
            p.name = "Rice";
            p.default_selling_price = 80;
            p.stock = 120;
            p.unit = "kg";
            p.created_at = now;
            p.updated_at = now;
        });

        const oil = await products.create((p) => {
            p.name = "Cooking Oil";
            p.default_selling_price = 2200;
            p.stock = 10;
            p.unit = "box";
            p.created_at = now;
            p.updated_at = now;
        });

        // ======================
        // Product Batches
        // ======================
        await batches.create((b) => {
            b.product_id = sugar.id;
            b.purchase_price = 55;
            b.quantity = 100;
            b.remaining_quantity = 40;
            b.unit = "kg";
            b.purchased_at = now - 1000 * 60 * 60 * 24 * 7;
            b.created_at = now;
            b.updated_at = now;
        });

        await batches.create((b) => {
            b.product_id = sugar.id;
            b.purchase_price = 58;
            b.quantity = 50;
            b.remaining_quantity = 50;
            b.unit = "kg";
            b.purchased_at = now - 1000 * 60 * 60 * 24 * 2;
            b.created_at = now;
            b.updated_at = now;
        });

        await batches.create((b) => {
            b.product_id = rice.id;
            b.purchase_price = 70;
            b.quantity = 120;
            b.remaining_quantity = 90;
            b.unit = "kg";
            b.purchased_at = now - 1000 * 60 * 60 * 24 * 5;
            b.created_at = now;
            b.updated_at = now;
        });

        await batches.create((b) => {
            b.product_id = oil.id;
            b.purchase_price = 2000;
            b.quantity = 10;
            b.remaining_quantity = 8;
            b.unit = "box";
            b.purchased_at = now - 1000 * 60 * 60 * 24 * 10;
            b.created_at = now;
            b.updated_at = now;
        });

        // ======================
        // Credit Sale
        // ======================
        const creditSale = await sales.create((s) => {
            s.customer_id = customer1.id;
            s.type = "credit";
            s.sold_at = now - 1000 * 60 * 60 * 24;
            s.created_at = now;
            s.updated_at = now;
        });

        const sugarItem = await saleItems.create((i) => {
            i.sale_id = creditSale.id;
            i.product_id = sugar.id;
            i.quantity = 30;
            i.unit = "kg";
            i.selling_price = 65;
            i.cost_price = 55;
            i.created_at = now;
            i.updated_at = now;
        });

        // ======================
        // Cash Sale
        // ======================
        const cashSale = await sales.create((s) => {
            s.type = "cash";
            s.sold_at = now;
            s.created_at = now;
            s.updated_at = now;
        });

        await saleItems.create((i) => {
            i.sale_id = cashSale.id;
            i.product_id = rice.id;
            i.quantity = 20;
            i.unit = "kg";
            i.selling_price = 80;
            i.cost_price = 70;
            i.created_at = now;
            i.updated_at = now;
        });

        // ======================
        // Partial Credit Payment
        // ======================
        const payment = await payments.create((p) => {
            p.customer_id = customer1.id;
            p.total_amount = 1000;
            p.paid_at = now;
            p.created_at = now;
            p.updated_at = now;
        });

        await paymentItems.create((pi) => {
            pi.credit_payment_id = payment.id;
            pi.sale_item_id = sugarItem.id;
            pi.amount_applied = 1000;
            pi.created_at = now;
            pi.updated_at = now;
        });

        console.log("✅ Seeding complete");
    });
};

export default seedDB;
