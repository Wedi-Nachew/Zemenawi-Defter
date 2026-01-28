import database from "../database";

const batchCollection = database.collections.get("product_batches");

// Adding stock to a product by creating a new product batch
const addStock = async (
    product,
    purchasePrice,
    quantity,
    purchasedAt = Date.now(),
) => {
    if (purchasePrice <= 0) {
        throw new Error("Purchase price must be greater than zero");
    }
    if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
    }

    return database.write(async () => {
        // Create new product batch
        await batchCollection.create((batch) => {
            batch.product.set(product);
            batch.purchasePrice = purchasePrice;
            batch.quantity = quantity;
            batch.remainingQuantity = quantity;
            batch.purchasedAt = purchasedAt;
            batch.createdAt = Date.now();
            batch.updatedAt = Date.now();
        });

        // Update product stock
        await product.update((p) => {
            p.stock += quantity;
            p.updatedAt = Date.now();
        });
    });
};

// Consuming stock from a product using FIFO from available batches
// NOTE: caller must already be inside database.write
const consumeStockFIFO = async (product, quantityNeeded) => {
    if (quantityNeeded <= 0) {
        throw new Error("Quantity needed must be greater than zero");
    }

    if (product.stock < quantityNeeded) {
        throw new Error("Insufficient stock available");
    }

    let quantityToConsume = quantityNeeded;
    let totalCost = 0;

    // Get batches for this product (relation already scoped)
    const batches = await product.batches.fetch();

    const fifoBatches = batches
        .filter((b) => (b.remainingQuantity || 0) > 0)
        .sort((a, b) => (a.purchasedAt || 0) - (b.purchasedAt || 0));

    for (const batch of fifoBatches) {
        if (quantityToConsume === 0) break;

        const takeQty = Math.min(batch.remainingQuantity, quantityToConsume);

        totalCost += takeQty * batch.purchasePrice;
        quantityToConsume -= takeQty;

        // Update batch remaining quantity
        await batch.update((b) => {
            b.remainingQuantity -= takeQty;
            b.updatedAt = Date.now();
        });
    }

    if (quantityToConsume > 0) {
        throw new Error("FIFO stock mismatch: not enough stock in batches");
    }

    // Update product stock
    await product.update((p) => {
        p.stock -= quantityNeeded;
        p.updatedAt = Date.now();
    });

    return totalCost;
};

export { addStock, consumeStockFIFO };
