import { Model } from "@nozbe/watermelondb";
import { date, field, relation } from "@nozbe/watermelondb/decorators";

class ProductBatch extends Model {
    static table = "product_batches";

    static associations = {
        products: { type: "belongs_to", key: "product_id" },
    };

    // a product batch belongs to a product
    @relation("products", "product_id") product;

    @field("product_id") productId;
    @field("purchase_price") purchasePrice;
    @field("quantity") quantity;
    @field("remaining_quantity") remainingQuantity;
    @date("purchased_at") purchasedAt;
    @date("created_at") createdAt;
    @date("updated_at") updatedAt;
}

export default ProductBatch;
