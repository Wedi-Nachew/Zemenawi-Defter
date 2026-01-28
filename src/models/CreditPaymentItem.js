import { Model } from "@nozbe/watermelondb";
import {
    date,
    field,
    readonly,
    relation,
} from "@nozbe/watermelondb/decorators";

class CreditPaymentItem extends Model {
    static table = "credit_payment_items";

    static associations = {
        credit_payments: { type: "belongs_to", key: "credit_payment_id" },
        sale_items: { type: "belongs_to", key: "sale_item_id" },
    };

    @field("credit_payment_id") creditPaymentId;
    @field("sale_item_id") saleItemId;
    @field("amount_applied") amountApplied;
    @readonly @date("created_at") createdAt;
    @date("updated_at") updatedAt;

    // a credit payment item belongs to a credit payment
    @relation("credit_payments", "credit_payment_id") creditPayment;

    // a credit payment item belongs to a sale item
    @relation("sale_items", "sale_item_id") saleItem;
}

export default CreditPaymentItem;
