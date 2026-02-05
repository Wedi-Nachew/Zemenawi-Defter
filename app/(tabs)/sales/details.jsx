import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Dialog,
    Divider,
    Icon,
    IconButton,
    Modal,
    Portal,
    Text,
    TextInput,
    TouchableRipple,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import database from "../../../src/database";
import { getCustomersWithBalances } from "../../../src/services/creditService";
import { createCustomer } from "../../../src/services/customerService";
import {
    deleteSale,
    getSaleById,
    getSaleItems,
} from "../../../src/services/saleService";
import theme from "../../../src/theme";

const SaleDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const [sale, setSale] = useState(null);
    const [items, setItems] = useState([]);
    const [customerName, setCustomerName] = useState("Walk-in");
    const [loading, setLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editSoldAt, setEditSoldAt] = useState("");
    const [editError, setEditError] = useState("");
    const [editType, setEditType] = useState("cash");
    const [editCustomer, setEditCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [customerQuery, setCustomerQuery] = useState("");
    const [addCustomerVisible, setAddCustomerVisible] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [editItem, setEditItem] = useState(null);
    const [editQty, setEditQty] = useState("");
    const [editPrice, setEditPrice] = useState("");

    useEffect(() => {
        let active = true;

        const loadSale = async () => {
            if (typeof id !== "string") return;
            setLoading(true);
            try {
                const saleRecord = await getSaleById(id);
                const saleItems = await getSaleItems(id);
                const resolvedItems = await Promise.all(
                    saleItems.map(async (record) => {
                        const product = await record.product.fetch();
                        return { record, product };
                    }),
                );
                const customer = saleRecord.customerId
                    ? await saleRecord.customer.fetch()
                    : null;

                if (!active) return;
                setSale(saleRecord);
                setItems(resolvedItems);
                setCustomerName(customer?.name || "Walk-in");
            } catch (error) {
                console.error("Failed to load sale details", error);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadSale();

        return () => {
            active = false;
        };
    }, [id]);

    useEffect(() => {
        let active = true;

        const loadCustomers = async () => {
            try {
                const rows = await getCustomersWithBalances();
                if (!active) return;
                setCustomers(
                    rows.map(({ customer, balance }) => ({
                        id: customer.id,
                        name: customer.name,
                        phone: customer.phone || "",
                        balance,
                        model: customer,
                    })),
                );
            } catch (error) {
                console.error("Failed to load customers", error);
            }
        };

        loadCustomers();

        return () => {
            active = false;
        };
    }, []);

    const filteredCustomers = useMemo(() => {
        const normalized = customerQuery.trim().toLowerCase();
        return customers.filter((customer) => {
            if (!normalized) return true;
            return (
                customer.name.toLowerCase().includes(normalized) ||
                customer.phone.includes(normalized)
            );
        });
    }, [customerQuery, customers]);

    const toNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };
    const totals = useMemo(
        () =>
            items.reduce(
                (acc, item) => {
                    const qty = toNumber(item.record?.quantity);
                    const price = toNumber(item.record?.sellingPrice);
                    const cost = toNumber(item.record?.costPrice);
                    acc.total += qty * price;
                    acc.cost += qty * cost;
                    acc.items += qty;
                    return acc;
                },
                { total: 0, cost: 0, items: 0 },
            ),
        [items],
    );
    if (loading || !sale) {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerTitle: "Sale Details",
                        headerTitleStyle: {
                            fontWeight: "700",
                            fontSize: 20,
                        },
                        headerTitleAlign: "center",
                    }}
                />
                <Screen style={styles.container}>
                    <Card style={styles.card}>
                        <Card.Content style={{ gap: 8, alignItems: "center" }}>
                            <Text style={styles.title}>
                                {loading ? "Loading sale…" : "Sale not found"}
                            </Text>
                            <Text style={styles.meta}>
                                {loading
                                    ? "Fetching sale details."
                                    : "Select a sale from history to view details."}
                            </Text>
                            {loading && (
                                <ActivityIndicator
                                    style={{ marginTop: 8 }}
                                    animating
                                />
                            )}
                            {!loading && (
                                <Button
                                    mode="contained"
                                    onPress={() => router.back()}
                                >
                                    Back to history
                                </Button>
                            )}
                        </Card.Content>
                    </Card>
                </Screen>
            </>
        );
    }

    const balance = sale.type === "credit" ? totals.total : 0;
    const profit = totals.total - totals.cost;
    const status = getStatusTone(sale.type);

    const openEdit = () => {
        const soldAtValue = sale.soldAt
            ? new Date(sale.soldAt).toLocaleString()
            : "";
        setEditSoldAt(soldAtValue);
        setEditError("");
        setEditType(sale.type || "cash");
        setEditCustomer(
            customers.find((c) => c.id === sale.customerId) || null,
        );
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        const parsedDate = Date.parse(editSoldAt);
        if (Number.isNaN(parsedDate)) {
            setEditError("Enter a valid date/time.");
            return;
        }

        if (editType === "credit" && !editCustomer) {
            setEditError("Customer is required for credit sales.");
            return;
        }

        setSaving(true);
        try {
            await database.write(async () => {
                await sale.update((s) => {
                    s.soldAt = parsedDate;
                    s.type = editType;
                    if (editType === "credit" && editCustomer?.model) {
                        s.customer.set(editCustomer.model);
                    } else {
                        s.customerId = null;
                    }
                    s.updatedAt = Date.now();
                });
            });
            setEditOpen(false);
        } catch (error) {
            console.error("Failed to edit sale", error);
            setEditError("Unable to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!sale) return;
        setDeleting(true);
        try {
            await deleteSale(sale.id);
            setDeleteOpen(false);
            router.back();
        } catch (error) {
            console.error("Failed to delete sale", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleAddCustomer = async () => {
        if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;
        try {
            const created = await createCustomer({
                name: newCustomerName,
                phone: newCustomerPhone,
            });
            const newCustomer = {
                id: created.id,
                name: created.name,
                phone: created.phone || "",
                balance: 0,
                model: created,
            };
            setCustomers((prev) => [newCustomer, ...prev]);
            setEditCustomer(newCustomer);
            setNewCustomerName("");
            setNewCustomerPhone("");
            setAddCustomerVisible(false);
            setCustomerModalOpen(false);
        } catch (error) {
            console.error("Failed to add customer", error);
        }
    };

    const openItemEdit = (item) => {
        setEditItem(item);
        setEditQty(String(item.record?.quantity ?? 0));
        setEditPrice(String(item.record?.sellingPrice ?? 0));
    };

    const handleItemEditSave = async () => {
        if (!editItem?.record) return;
        const qty = Number(editQty) || 0;
        const price = Number(editPrice) || 0;

        setSaving(true);
        try {
            await database.write(async () => {
                await editItem.record.update((r) => {
                    r.quantity = qty;
                    r.sellingPrice = price;
                    r.updatedAt = Date.now();
                });
            });
            setEditItem(null);
        } catch (error) {
            console.error("Failed to edit item", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: customerName,
                    headerTitleStyle: {
                        fontWeight: "700",
                        fontSize: 20,
                    },
                    headerTitleAlign: "center",
                }}
            />
            <Screen>
                <ScrollView
                    style={{ flex: 1, gap: 16 }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.container}
                >
                    <Card style={styles.heroCard}>
                        <Card.Content style={{ gap: 12 }}>
                            <View style={styles.heroRow}>
                                <View
                                    style={[
                                        styles.avatar,
                                        { backgroundColor: status.iconBg },
                                    ]}
                                >
                                    <Icon
                                        source={status.icon}
                                        color={status.iconColor}
                                        size={18}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cardTitle}>
                                        {customerName}
                                    </Text>
                                    <Text style={styles.meta}>
                                        {sale.id.slice(0, 8).toUpperCase()} •{" "}
                                        {sale.soldAt
                                            ? new Date(
                                                  sale.soldAt,
                                              ).toLocaleString()
                                            : ""}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusPill,
                                        { backgroundColor: status.pillBg },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: status.pillText },
                                        ]}
                                    >
                                        {status.label}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.amountRow}>
                                <Text style={styles.meta}>Total</Text>
                                <Text style={styles.amountValue}>
                                    ETB{" "}
                                    {toNumber(totals.total).toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.amountRow}>
                                <Text style={styles.meta}>Profit / Loss</Text>
                                <Text
                                    style={
                                        profit >= 0
                                            ? styles.profit
                                            : styles.loss
                                    }
                                >
                                    {profit >= 0
                                        ? `ETB ${toNumber(profit).toLocaleString()}`
                                        : `- ETB ${Math.abs(toNumber(profit)).toLocaleString()}`}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content style={{ gap: 10 }}>
                            <Text style={styles.sectionTitle}>Items</Text>
                            {items.map((item, idx) => (
                                <View
                                    key={`${item.record?.id || "item"}-${idx}`}
                                    style={styles.itemRow}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardTitle}>
                                            {item.product?.name || "Item"}
                                        </Text>
                                        <Text style={styles.meta}>
                                            Qty{" "}
                                            {toNumber(item.record?.quantity)} •
                                            ETB{" "}
                                            {toNumber(
                                                item.record?.sellingPrice,
                                            ).toLocaleString()}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemTotal}>
                                        ETB{" "}
                                        {(
                                            toNumber(item.record?.quantity) *
                                            toNumber(item.record?.sellingPrice)
                                        ).toLocaleString()}
                                    </Text>
                                    <Button
                                        mode="text"
                                        onPress={() => openItemEdit(item)}
                                        labelStyle={styles.linkButton}
                                    >
                                        Edit
                                    </Button>
                                    {idx < items.length - 1 && (
                                        <Divider style={{ marginTop: 10 }} />
                                    )}
                                </View>
                            ))}
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content style={{ gap: 10 }}>
                            <Text style={styles.sectionTitle}>Payment</Text>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Method</Text>
                                <Text style={styles.cardTitle}>
                                    {sale.type === "credit" ? "Credit" : "Cash"}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Paid</Text>
                                <Text style={styles.cardTitle}>
                                    ETB{" "}
                                    {toNumber(totals.total).toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Balance</Text>
                                <Text
                                    style={[
                                        styles.cardTitle,
                                        {
                                            color:
                                                balance > 0
                                                    ? theme.colors.warning
                                                    : theme.colors.secondary,
                                        },
                                    ]}
                                >
                                    ETB {toNumber(balance).toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Profit / Loss</Text>
                                <Text
                                    style={
                                        profit >= 0
                                            ? styles.profit
                                            : styles.loss
                                    }
                                >
                                    {profit >= 0
                                        ? `ETB ${toNumber(profit).toLocaleString()}`
                                        : `- ETB ${Math.abs(toNumber(profit)).toLocaleString()}`}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <Card style={styles.summaryCard}>
                        <Card.Content style={styles.summaryRow}>
                            <View>
                                <Text style={styles.meta}>Items Count</Text>
                                <Text style={styles.cardTitle}>
                                    {toNumber(totals.items)} Units
                                </Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                                <Text style={styles.meta}>Total Payable</Text>
                                <Text style={styles.amountValue}>
                                    ETB{" "}
                                    {toNumber(totals.total).toLocaleString()}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                </ScrollView>

                <View style={styles.actionsRow}>
                    <Button
                        mode="contained"
                        icon="pencil"
                        style={{ flex: 1 }}
                        onPress={openEdit}
                    >
                        Edit Sale
                    </Button>
                    <Button
                        mode="outlined"
                        icon="trash-can-outline"
                        style={{ flex: 1, borderColor: theme.colors.error }}
                        onPress={() => setDeleteOpen(true)}
                        labelStyle={{ color: theme.colors.error }}
                    >
                        Delete Sale
                    </Button>
                </View>
                <Portal>
                    <Dialog
                        visible={deleteOpen}
                        onDismiss={() => setDeleteOpen(false)}
                        style={styles.dialog}
                    >
                        <Dialog.Title style={styles.dialogTitle}>
                            Delete sale?
                        </Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.meta}>
                                This action can’t be undone.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                mode="text"
                                onPress={() => setDeleteOpen(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                buttonColor={theme.colors.error}
                                onPress={handleDelete}
                                loading={deleting}
                                disabled={deleting}
                            >
                                Delete
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Modal
                        visible={editOpen}
                        onDismiss={() => setEditOpen(false)}
                        contentContainerStyle={styles.editSheet}
                    >
                        <ScrollView
                            contentContainerStyle={styles.editContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.editHeader}>
                                <Text style={styles.dialogTitle}>
                                    Edit Sale
                                </Text>
                                <IconButton
                                    icon="close"
                                    onPress={() => setEditOpen(false)}
                                />
                            </View>

                            <Text style={styles.sectionTitle}>Date & Time</Text>
                            <TextInput
                                mode="outlined"
                                value={editSoldAt}
                                onChangeText={setEditSoldAt}
                                style={styles.dialogInput}
                            />

                            <Text style={styles.sectionTitle}>
                                Payment Type
                            </Text>
                            <View style={styles.editRow}>
                                <Button
                                    mode={
                                        editType === "cash"
                                            ? "contained"
                                            : "outlined"
                                    }
                                    onPress={() => setEditType("cash")}
                                >
                                    Cash
                                </Button>
                                <Button
                                    mode={
                                        editType === "credit"
                                            ? "contained"
                                            : "outlined"
                                    }
                                    onPress={() => setEditType("credit")}
                                >
                                    Credit
                                </Button>
                            </View>

                            <Text style={styles.sectionTitle}>Customer</Text>
                            <Button
                                mode="outlined"
                                onPress={() => setCustomerModalOpen(true)}
                            >
                                {editCustomer?.name || "Select customer"}
                            </Button>

                            {!!editError && (
                                <Text style={styles.errorText}>
                                    {editError}
                                </Text>
                            )}

                            <View style={styles.editActions}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setEditOpen(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleEditSave}
                                    loading={saving}
                                    disabled={saving}
                                >
                                    Save
                                </Button>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal
                        visible={customerModalOpen}
                        onDismiss={() => setCustomerModalOpen(false)}
                        contentContainerStyle={styles.editSheet}
                    >
                        <ScrollView
                            contentContainerStyle={styles.editContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.editHeader}>
                                <Text style={styles.dialogTitle}>
                                    Select Customer
                                </Text>
                                <IconButton
                                    icon="close"
                                    onPress={() => setCustomerModalOpen(false)}
                                />
                            </View>
                            <TextInput
                                mode="outlined"
                                value={customerQuery}
                                onChangeText={setCustomerQuery}
                                placeholder="Search customers..."
                                style={styles.dialogInput}
                            />
                            <View style={styles.modalList}>
                                {filteredCustomers.length === 0 ? (
                                    <Text style={styles.meta}>
                                        No customers found.
                                    </Text>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <TouchableRipple
                                            key={customer.id}
                                            onPress={() => {
                                                setEditCustomer(customer);
                                                setCustomerModalOpen(false);
                                            }}
                                            style={styles.suggestionRow}
                                        >
                                            <View style={styles.modalItemRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={styles.cardTitle}
                                                    >
                                                        {customer.name}
                                                    </Text>
                                                    <Text style={styles.meta}>
                                                        {customer.phone}
                                                    </Text>
                                                </View>
                                                <Text style={styles.modalPrice}>
                                                    ETB{" "}
                                                    {customer.balance.toLocaleString()}
                                                </Text>
                                            </View>
                                        </TouchableRipple>
                                    ))
                                )}
                            </View>
                            <Button
                                mode="outlined"
                                icon="account-plus-outline"
                                onPress={() =>
                                    setAddCustomerVisible((prev) => !prev)
                                }
                                style={styles.addCustomerButton}
                            >
                                {addCustomerVisible
                                    ? "Close"
                                    : "Add New Customer"}
                            </Button>
                            {addCustomerVisible && (
                                <View style={styles.modalEditor}>
                                    <Text style={styles.sectionTitle}>
                                        New Customer
                                    </Text>
                                    <TextInput
                                        mode="outlined"
                                        label="Full Name"
                                        value={newCustomerName}
                                        onChangeText={setNewCustomerName}
                                        style={styles.dialogInput}
                                    />
                                    <TextInput
                                        mode="outlined"
                                        label="Phone"
                                        value={newCustomerPhone}
                                        onChangeText={setNewCustomerPhone}
                                        keyboardType="phone-pad"
                                        style={styles.dialogInput}
                                    />
                                    <Button
                                        mode="contained"
                                        onPress={handleAddCustomer}
                                    >
                                        Save Customer
                                    </Button>
                                </View>
                            )}
                        </ScrollView>
                    </Modal>
                    <Modal
                        visible={!!editItem}
                        onDismiss={() => setEditItem(null)}
                        contentContainerStyle={styles.editSheet}
                    >
                        <ScrollView
                            contentContainerStyle={styles.editContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.editHeader}>
                                <Text style={styles.dialogTitle}>
                                    Edit Item
                                </Text>
                                <IconButton
                                    icon="close"
                                    onPress={() => setEditItem(null)}
                                />
                            </View>
                            <Text style={styles.cardTitle}>
                                {editItem?.product?.name || "Item"}
                            </Text>
                            <View style={styles.editRow}>
                                <TextInput
                                    mode="outlined"
                                    label="Qty"
                                    value={editQty}
                                    onChangeText={setEditQty}
                                    keyboardType="numeric"
                                    style={styles.editField}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Price"
                                    value={editPrice}
                                    onChangeText={setEditPrice}
                                    keyboardType="numeric"
                                    style={styles.editField}
                                    right={<TextInput.Affix text="ETB" />}
                                />
                            </View>
                            <View style={styles.editActions}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setEditItem(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleItemEditSave}
                                    loading={saving}
                                    disabled={saving}
                                >
                                    Save
                                </Button>
                            </View>
                        </ScrollView>
                    </Modal>
                </Portal>
            </Screen>
        </>
    );
};

const getStatusTone = (status) => {
    if (status === "credit") {
        return {
            label: "Credit",
            icon: "file-document-outline",
            iconBg: "#DBEAFE",
            iconColor: theme.colors.primary,
            pillBg: "#E0EAFF",
            pillText: theme.colors.primary,
        };
    }
    if (status === "partial") {
        return {
            label: "Partial",
            icon: "account-alert-outline",
            iconBg: "#FEF3C7",
            iconColor: theme.colors.warning,
            pillBg: "#FEF3C7",
            pillText: theme.colors.warning,
        };
    }
    return {
        label: "Paid",
        icon: "account-check-outline",
        iconBg: "#DCFCE7",
        iconColor: theme.colors.secondary,
        pillBg: "#DCFCE7",
        pillText: theme.colors.secondary,
    };
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingBottom: 32,
        paddingTop: 4,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    title: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    meta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    heroCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    heroRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    cardTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    cardCenter: {
        alignItems: "center",
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amountValue: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 20,
    },
    profit: {
        color: theme.colors.secondary,
        fontWeight: "700",
    },
    loss: {
        color: theme.colors.error,
        fontWeight: "700",
    },
    sectionTitle: {
        color: theme.colors.onSurface,
        fontWeight: "600",
        textTransform: "uppercase",
        fontSize: 12,
    },
    itemRow: {
        gap: 8,
    },
    itemTotal: {
        color: theme.colors.text,
        fontWeight: "700",
        alignSelf: "flex-end",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        elevation: 0,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dialog: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
    },
    dialogTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    dialogInput: {
        marginTop: 8,
        backgroundColor: theme.colors.surface,
    },
    modalList: {
        marginTop: 12,
        gap: 6,
    },
    modalItemRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    modalPrice: {
        color: theme.colors.onSurface,
        fontSize: 12,
        fontWeight: "600",
    },
    suggestionRow: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    addCustomerButton: {
        marginTop: 12,
        borderRadius: 12,
    },
    modalEditor: {
        marginTop: 16,
        gap: 12,
    },
    linkButton: {
        color: theme.colors.primary,
        fontWeight: "600",
    },
    editSheet: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        marginTop: "auto",
        padding: 16,
        maxHeight: "90%",
    },
    editContent: {
        gap: 12,
        paddingBottom: 12,
    },
    editHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    editRow: {
        flexDirection: "row",
        gap: 10,
    },
    editField: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    editActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    customerPick: {
        marginVertical: 4,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 6,
    },
});

export default SaleDetailsScreen;
