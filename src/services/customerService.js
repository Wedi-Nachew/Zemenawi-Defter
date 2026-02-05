import database from "../database";

const customerCollection = database.collections.get("customers");

const createCustomer = async ({ name, phone } = {}) => {
    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();

    if (!trimmedName) {
        throw new Error("Customer name is required.");
    }

    return await database.write(async () => {
        const existing = await customerCollection.query().fetch();
        const normalized = trimmedName.toLowerCase();
        const duplicate = existing.find(
            (c) => c.name?.trim().toLowerCase() === normalized,
        );

        if (duplicate) {
            throw new Error("Customer name already exists.");
        }

        return customerCollection.create((customer) => {
            customer.name = trimmedName;
            customer.phone = trimmedPhone || "";
            customer.updatedAt = Date.now();
        });
    });
};

const getCustomers = async () => {
    return await customerCollection.query().fetch();
};

export { createCustomer, getCustomers };
