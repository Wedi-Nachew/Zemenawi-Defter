const seedDB = async (database) => {
    const productsCollection = database.collections.get("products");
    const batchesCollection = database.collections.get("product_batches");
    const customersCollection = database.collections.get("customers");
    const salesCollection = database.collections.get("sales");
    const saleItemsCollection = database.collections.get("sale_items");
    const creditPaymentsCollection =
        database.collections.get("credit_payments");
    const creditPaymentItemsCollection = database.collections.get(
        "credit_payment_items",
    );

    // const existingProducts = await productsCollection.query().fetch();
    // if (existingProducts.length > 0) {
    //     console.log("Database already seeded");
    //     return;
    // }

    const now = Date.now();

    await database.write(async () => {
        // reset database
        await database.unsafeResetDatabase();
        /* ------------------ PRODUCTS ------------------ */
        const teff = await productsCollection.create((p) => {
            p.name = "Teff Flour";
            p.unit = "quintal";
            p.stock = 3;
            p.default_selling_price = 7800;
            p.created_at = now;
            p.updated_at = now;
        });

        const sugar = await productsCollection.create((p) => {
            p.name = "Sugar";
            p.unit = "kg";
            p.stock = 42;
            p.default_selling_price = 65;
            p.created_at = now;
            p.updated_at = now;
        });

        const water = await productsCollection.create((p) => {
            p.name = "Mineral Water";
            p.unit = "box";
            p.stock = 5;
            p.default_selling_price = 320;
            p.created_at = now;
            p.updated_at = now;
        });

        const eggs = await productsCollection.create((p) => {
            p.name = "Eggs";
            p.unit = "dozen";
            p.stock = 8;
            p.default_selling_price = 180;
            p.created_at = now;
            p.updated_at = now;
        });

        /* ------------------ PRODUCT BATCHES ------------------ */
        await batchesCollection.create((b) => {
            b.product_id = teff.id;
            b.purchase_price = 7200;
            b.quantity = 2;
            b.remaining_quantity = 1;
            b.purchased_at = now - 10 * 86400000;
            b.created_at = now;
            b.updated_at = now;
        });

        await batchesCollection.create((b) => {
            b.product_id = teff.id;
            b.purchase_price = 7400;
            b.quantity = 2;
            b.remaining_quantity = 2;
            b.purchased_at = now - 4 * 86400000;
            b.created_at = now;
            b.updated_at = now;
        });

        await batchesCollection.create((b) => {
            b.product_id = sugar.id;
            b.purchase_price = 58;
            b.quantity = 50;
            b.remaining_quantity = 42;
            b.purchased_at = now - 6 * 86400000;
            b.created_at = now;
            b.updated_at = now;
        });

        /* ------------------ CUSTOMERS ------------------ */
        const abeba = await customersCollection.create((c) => {
            c.name = "Abeba Store";
            c.phone = "0912345678";
            c.created_at = now;
            c.updated_at = now;
        });

        const samson = await customersCollection.create((c) => {
            c.name = "Samson Bakery";
            c.phone = "0922334455";
            c.created_at = now;
            c.updated_at = now;
        });

        /* ------------------ SALES ------------------ */
        const sale1 = await salesCollection.create((s) => {
            s.customer_id = abeba.id;
            s.type = "cash";
            s.sold_at = now - 60 * 60 * 1000;
            s.created_at = now;
            s.updated_at = now;
        });

        const sale2 = await salesCollection.create((s) => {
            s.customer_id = samson.id;
            s.type = "credit";
            s.sold_at = now - 3 * 60 * 60 * 1000;
            s.created_at = now;
            s.updated_at = now;
        });

        /* ------------------ SALE ITEMS ------------------ */
        const saleItem1 = await saleItemsCollection.create((si) => {
            si.sale_id = sale1.id;
            si.product_id = sugar.id;
            si.quantity = 10;
            si.selling_price = 65;
            si.cost_price = 58;
            si.created_at = now;
            si.updated_at = now;
        });

        const saleItem2 = await saleItemsCollection.create((si) => {
            si.sale_id = sale2.id;
            si.product_id = teff.id;
            si.quantity = 1;
            si.selling_price = 8000;
            si.cost_price = 7200;
            si.created_at = now;
            si.updated_at = now;
        });

        /* ------------------ CREDIT PAYMENT ------------------ */
        const payment = await creditPaymentsCollection.create((p) => {
            p.customer_id = samson.id;
            p.total_amount = 3000;
            p.paid_at = now;
            p.created_at = now;
            p.updated_at = now;
        });

        await creditPaymentItemsCollection.create((cpi) => {
            cpi.credit_payment_id = payment.id;
            cpi.sale_item_id = saleItem2.id;
            cpi.amount_applied = 3000;
            cpi.created_at = now;
            cpi.updated_at = now;
        });
    });

    console.log("Database seeded successfully");
};

export default seedDB;
