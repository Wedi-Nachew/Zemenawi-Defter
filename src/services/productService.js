import database from "../database";

const productCollection = database.collections.get("products");

// Create a new product - NO stock, NO batches
const createProduct = async (productData) => {
    return await database.write(async () => {
        return productCollection.create((product) => {
            product.name = productData.name;
            if (productData.defaultSellingPrice <= 0) {
                throw new Error(
                    "Default selling price must be greater than zero.",
                );
            }
            product.defaultSellingPrice = productData.defaultSellingPrice;
            product.stock = 0; // initial stock is zero
            product.unit = productData.unit;
            product.createdAt = Date.now();
            product.updatedAt = Date.now();
        });
    });
};

// Update product metadata only
const updateProduct = async (product, updatedData) => {
    return await database.write(async () => {
        return product.update((p) => {
            if (updatedData.name !== undefined) p.name = updatedData.name;
            if (updatedData.defaultSellingPrice !== undefined) {
                if (updatedData.defaultSellingPrice <= 0) {
                    throw new Error(
                        "Default selling price must be greater than zero.",
                    );
                }
                p.defaultSellingPrice = updatedData.defaultSellingPrice;
            }
            // Stock updates should go through inventoryService addStock/consumeStockFIFO
            if (updatedData.unit !== undefined) p.unit = updatedData.unit;
            p.updatedAt = Date.now();
        });
    });
};

// Delete a product, only if no stock
const deleteProduct = async (product) => {
    if (product.stock > 0) {
        throw new Error("Cannot delete product with remaining stock.");
    }

    return await database.write(async () => {
        await product.markAsDeleted();
    });
};

// Fetch all products (reactive query can be done outside)
const getAllProducts = async () => {
    return await productCollection.query();
};

export { createProduct, deleteProduct, getAllProducts, updateProduct };
