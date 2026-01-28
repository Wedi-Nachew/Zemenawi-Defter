import { Model } from "@nozbe/watermelondb";
import {
    children,
    date,
    field,
    readonly,
} from "@nozbe/watermelondb/decorators";

class Product extends Model {
    static table = "products";

    static associations = {
        sale_items: { type: "has_many", foreignKey: "product_id" },
        product_batches: { type: "has_many", foreignKey: "product_id" },
    };

    @field("name") name;
    @field("default_selling_price") defaultSellingPrice;
    @field("stock") stock;
    @field("unit") unit;
    @readonly @date("created_at") createdAt;
    @date("updated_at") updatedAt;

    // a product can have many sale items
    @children("sale_items") saleItems;

    // a product can have many product batches
    @children("product_batches") batches;

    get isInStock() {
        return this.stock > 0;
    }

    get isLowStock() {
        return this.stock > 0 && this.stock <= 5;
    }
}

export default Product;
