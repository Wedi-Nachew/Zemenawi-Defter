import { Model } from "@nozbe/watermelondb";
import {
    children,
    date,
    field,
    readonly,
    relation,
} from "@nozbe/watermelondb/decorators";

class SaleItem extends Model {
    static table = "sale_items";

    static associations = {
        sales: { type: "belongs_to", key: "sale_id" },
        products: { type: "belongs_to", key: "product_id" },
        credit_payment_items: {
            type: "has_many",
            foreignKey: "sale_item_id",
        },
    };

    @field("sale_id") saleId;
    @field("product_id") productId;
    @field("quantity") quantity;
    @field("selling_price") sellingPrice;
    @field("cost_price") costPrice; // FIFO calculated cost price
    @readonly @date("created_at") createdAt;
    @date("updated_at") updatedAt;

    // a sale item belongs to a sale
    @relation("sales", "sale_id") sale;

    // a sale item belongs to a product
    @relation("products", "product_id") product;

    // a sale item has many credit payment items
    @children("credit_payment_items") creditPaymentItems;

    // Calculate total price for this sale item
    get totalPrice() {
        return this.quantity * this.sellingPrice;
    }
}

export default SaleItem;
