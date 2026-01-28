import { Model } from "@nozbe/watermelondb";
import {
    children,
    date,
    field,
    readonly,
    relation,
} from "@nozbe/watermelondb/decorators";

class CreditPayment extends Model {
    static table = "credit_payments";

    static associations = {
        customers: { type: "belongs_to", key: "customer_id" },
        credit_payment_items: {
            type: "has_many",
            foreignKey: "credit_payment_id",
        },
    };

    @field("customer_id") customerId;
    @field("total_amount") totalAmount;
    @field("paid_at") paidAt;
    @readonly @date("created_at") createdAt;
    @date("updated_at") updatedAt;

    // a credit payment belongs to a customer
    @relation("customers", "customer_id") customer;

    // a credit payment has many credit payment items
    @children("credit_payment_items") paymentItems;
}

export default CreditPayment;
