import { Model } from "@nozbe/watermelondb";
import {
    children,
    date,
    field,
    readonly,
    relation,
} from "@nozbe/watermelondb/decorators";

class Sale extends Model {
    static table = "sales";

    static associations = {
        customers: { type: "belongs_to", key: "customer_id" },
        sale_items: { type: "has_many", foreignKey: "sale_id" },
    };

    // Define relationships and methods here as needed
    @field("customer_id") customerId;
    @field("type") type;
    @date("sold_at") soldAt;
    @readonly @date("created_at") createdAt;
    @date("updated_at") updatedAt;

    // a sale can have many sale items
    @children("sale_items") saleItems;

    // a sale belongs to a customer
    @relation("customers", "customer_id") customer;

    // check if the sale is a credit sale
    get isCredit() {
        return this.type === "credit";
    }

    // check if the sale is a cash sale
    get isCash() {
        return this.type === "cash";
    }
}

export default Sale;
