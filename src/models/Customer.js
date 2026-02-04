import { Model, Q } from "@nozbe/watermelondb";
import {
    children,
    date,
    field,
    readonly,
} from "@nozbe/watermelondb/decorators";

class Customer extends Model {
    static table = "customers";

    static associations = {
        sales: { type: "has_many", foreignKey: "customer_id" },
        credit_payments: { type: "has_many", foreignKey: "customer_id" },
    };

    @field("name") name;
    @field("phone") phone;
    @readonly @date("created_at") createdAt;
    @date("updated_at") updatedAt;

    // A customer can have many sales
    @children("sales") sales;

    // A customer can have many payments
    @children("credit_payments") creditPayments;

    // Get only credit sales for this customer
    get creditSales() {
        return this.sales.extend(Q.where("type", "credit"));
    }
}

export default Customer;
