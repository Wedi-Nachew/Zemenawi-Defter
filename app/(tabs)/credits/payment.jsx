import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Icon,
    IconButton,
    Modal,
    Portal,
    Text,
    TextInput,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import {
    getCustomerById,
    getCustomerUnpaidItems,
    payGenericFIFO,
    payTowardSaleItems,
} from "../../../src/services/creditService";
import theme from "../../../src/theme";

const MakePaymentScreen = () => {
    const { id } = useLocalSearchParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("auto");
    const [selected, setSelected] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [unpaidItems, setUnpaidItems] = useState([]);
    const [lastPaidAmount, setLastPaidAmount] = useState(0);
    const [lastReceiptNo, setLastReceiptNo] = useState("");
    const isMounted = useRef(true);

    const loadCustomer = async () => {
        if (typeof id !== "string") return;
        setLoading(true);
        setError("");
        try {
            const record = await getCustomerById(id);
            const unpaid = await getCustomerUnpaidItems(record);
            const enriched = await Promise.all(
                unpaid.map(async (entry) => {
                    const product = await entry.saleItem.product.fetch();
                    return {
                        id: entry.saleItem.id,
                        title: product?.name || "Item",
                        date: entry.sale?.soldAt
                            ? new Date(entry.sale.soldAt).toLocaleDateString()
                            : "",
                        amount: entry.remainingBalance,
                        saleItem: entry.saleItem,
                    };
                }),
            );
            if (!isMounted.current) return;
            setCustomer(record);
            setUnpaidItems(enriched);
        } catch (loadError) {
            console.error("Failed to load customer", loadError);
            if (isMounted.current) {
                setError("Unable to load customer details.");
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMounted.current = true;
        loadCustomer();

        return () => {
            isMounted.current = false;
        };
    }, [id]);

    const totalOutstanding = useMemo(
        () => unpaidItems.reduce((sum, item) => sum + item.amount, 0),
        [unpaidItems],
    );

    const invoices = useMemo(() => {
        return unpaidItems.map((item, index) => ({
            ...item,
            invoiceNo: `Inv #${String(index + 1).padStart(3, "0")}`,
        }));
    }, [unpaidItems]);

    const parsedAmount = Number(String(amount).replace(/,/g, "")) || 0;

    const autoSelected = useMemo(() => {
        if (parsedAmount <= 0) return [];
        let remaining = parsedAmount;
        const ids = [];
        for (const inv of invoices) {
            if (remaining <= 0) break;
            ids.push(inv.id);
            remaining -= inv.amount;
        }
        return ids;
    }, [invoices, parsedAmount]);

    const activeSelected = mode === "auto" ? autoSelected : selected;

    const selectedTotal = useMemo(() => {
        return invoices
            .filter((inv) => selected.includes(inv.id))
            .reduce((sum, inv) => sum + inv.amount, 0);
    }, [invoices, selected]);

    const buildAllocations = () => {
        let remaining = parsedAmount;
        const list =
            mode === "auto"
                ? invoices
                : invoices.filter((inv) => selected.includes(inv.id));
        const allocations = [];
        for (const inv of list) {
            if (remaining <= 0) break;
            const amountToApply = Math.min(inv.amount, remaining);
            allocations.push({ saleItem: inv.saleItem, amount: amountToApply });
            remaining -= amountToApply;
        }
        return allocations;
    };

    const handleConfirm = async () => {
        setError("");
        if (parsedAmount <= 0) {
            setError("Enter a valid amount.");
            return;
        }
        if (parsedAmount > totalOutstanding) {
            setError("Amount exceeds outstanding balance.");
            return;
        }
        if (mode === "select" && selected.length === 0) {
            setError("Select at least one item.");
            return;
        }
        if (mode === "select" && parsedAmount > selectedTotal) {
            setError("Amount exceeds selected items total.");
            return;
        }

        setSaving(true);
        try {
            if (mode === "auto") {
                const payment = await payGenericFIFO(customer, parsedAmount);
                setLastPaidAmount(parsedAmount);
                setLastReceiptNo(payment?.receiptNo || "");
            } else {
                const allocations = buildAllocations();
                const paidAmount = allocations.reduce(
                    (sum, entry) => sum + entry.amount,
                    0,
                );
                const payment = await payTowardSaleItems(customer, allocations);
                setLastPaidAmount(paidAmount);
                setLastReceiptNo(payment?.receiptNo || "");
            }
            await loadCustomer();
            setAmount("");
            setSelected([]);
            setMode("auto");
            setShowSuccess(true);
        } catch (paymentError) {
            console.error("Failed to apply payment", paymentError);
            setError("Unable to record payment.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !customer) {
        return (
            <Screen contentContainerStyle={styles.container}>
                <View style={styles.headerRow}>
                    <IconButton
                        icon="arrow-left"
                        onPress={() => router.back()}
                    />
                    <Text variant="titleMedium" style={styles.title}>
                        Make Payment
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.meta}>
                            {loading
                                ? "Loading customer…"
                                : error || "Customer not found."}
                        </Text>
                        {loading && <ActivityIndicator />}
                    </Card.Content>
                </Card>
            </Screen>
        );
    }

    return (
        <Screen style={styles.container}>
            <View style={styles.amountBlock}>
                <Text style={styles.label}>Amount to Pay</Text>
                <TextInput
                    mode="outlined"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    outlineColor="#E5E7EB"
                    activeOutlineColor={theme.colors.primary}
                    style={styles.amountInput}
                    contentStyle={styles.amountContent}
                    right={<TextInput.Affix text="ETB" />}
                />
            </View>

            <View style={styles.modeRow}>
                <Chip
                    selected={mode === "auto"}
                    onPress={() => setMode("auto")}
                    mode={mode === "auto" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    style={[
                        styles.modeChip,
                        mode === "auto" && styles.modeChipActive,
                    ]}
                    textStyle={{
                        color: mode === "auto" ? "#FFFFFF" : theme.colors.text,
                    }}
                >
                    Automatic (FIFO)
                </Chip>
                <Chip
                    selected={mode === "select"}
                    onPress={() => setMode("select")}
                    mode={mode === "select" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    style={[
                        styles.modeChip,
                        mode === "select" && styles.modeChipActive,
                    ]}
                    textStyle={{
                        color:
                            mode === "select" ? "#FFFFFF" : theme.colors.text,
                    }}
                >
                    Select Items
                </Chip>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Unpaid invoices</Text>
                <Chip
                    compact
                    mode="outlined"
                    style={styles.selectedChip}
                    textStyle={styles.selectedChipText}
                >
                    {activeSelected.length} selected
                </Chip>
            </View>

            <Card style={styles.card}>
                <Card.Content style={{ gap: 12 }}>
                    {invoices.length === 0 && (
                        <Text style={styles.meta}>No unpaid items.</Text>
                    )}
                    {invoices.map((inv) => {
                        const isSelected = activeSelected.includes(inv.id);
                        return (
                            <Pressable
                                key={inv.id}
                                onPress={() => {
                                    if (mode !== "select") return;
                                    setSelected((prev) =>
                                        prev.includes(inv.id)
                                            ? prev.filter(
                                                  (itemId) => itemId !== inv.id,
                                              )
                                            : [...prev, inv.id],
                                    );
                                }}
                            >
                                <View
                                    style={[
                                        styles.invoiceRow,
                                        isSelected && styles.invoiceRowActive,
                                    ]}
                                >
                                    <View style={styles.checkbox}>
                                        <View
                                            style={[
                                                styles.checkboxInner,
                                                isSelected &&
                                                    styles.checkboxSelected,
                                            ]}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.invoiceTitle}>
                                            {inv.invoiceNo} - {inv.title}
                                        </Text>
                                        <Text style={styles.meta}>
                                            {inv.date}
                                        </Text>
                                    </View>
                                    <Text style={styles.invoiceAmount}>
                                        ETB {inv.amount.toLocaleString()}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </Card.Content>
            </Card>

            <View style={styles.totalRow}>
                <Text style={styles.meta}>Total Allocating</Text>
                <Text style={styles.totalValue}>ETB {amount}</Text>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Button
                mode="contained"
                icon="arrow-right"
                contentStyle={styles.confirmContent}
                style={styles.confirmButton}
                onPress={handleConfirm}
                loading={saving}
                disabled={saving}
            >
                Confirm Payment
            </Button>

            <Portal>
                <Modal
                    visible={showSuccess}
                    onDismiss={() => setShowSuccess(false)}
                    contentContainerStyle={styles.successSheet}
                >
                    <View style={styles.sheetHandle} />
                    <View style={styles.successHeader}>
                        <View style={styles.checkWrap}>
                            <Icon source="check" size={20} color="#FFFFFF" />
                        </View>
                        <View>
                            <Text style={styles.successTitle}>
                                Payment Successful
                            </Text>
                            <Text style={styles.successSubtitle}>
                                Transaction completed successfully
                            </Text>
                        </View>
                    </View>

                    <Card style={styles.receiptCard}>
                        <Card.Content style={{ gap: 12 }}>
                            <View style={styles.amountBlock}>
                                <Text style={styles.amountLabel}>
                                    Amount Paid
                                </Text>
                                <Text style={styles.amountValue}>
                                    ETB {lastPaidAmount.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Receipt No</Text>
                                <Text style={styles.metaStrong}>
                                    {lastReceiptNo || "-"}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Customer</Text>
                                <Text style={styles.metaStrong}>
                                    {customer?.name ?? "Customer"}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Date</Text>
                                <Text style={styles.metaStrong}>
                                    {new Date().toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>
                                    Remaining Balance
                                </Text>
                                <Text style={styles.metaStrong}>
                                    ETB{" "}
                                    {Math.max(
                                        totalOutstanding - lastPaidAmount,
                                        0,
                                    ).toLocaleString()}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <Button
                        mode="contained"
                        onPress={() => setShowSuccess(false)}
                        style={styles.doneButton}
                    >
                        Done
                    </Button>
                </Modal>
            </Portal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    meta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    label: {
        color: theme.colors.onSurface,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    amountBlock: {
        gap: 8,
        marginTop: 8,
    },
    amountInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
    },
    amountContent: {
        fontSize: 22,
        fontWeight: "700",
        height: 52,
    },
    modeRow: {
        flexDirection: "row",
        gap: 8,
    },
    modeChip: {
        flex: 1,
        borderRadius: 999,
    },
    modeChipActive: {
        backgroundColor: theme.colors.primary,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionLabel: {
        color: theme.colors.onSurface,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    sectionMeta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    selectedChip: {
        borderRadius: 999,
        backgroundColor: "#E0EAFF",
        borderColor: "#E0EAFF",
    },
    selectedChipText: {
        color: theme.colors.primary,
        fontWeight: "700",
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    invoiceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    invoiceRowActive: {
        borderColor: theme.colors.primary,
        backgroundColor: "#EFF6FF",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#CBD5F5",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    checkboxSelected: {
        backgroundColor: theme.colors.primary,
        borderRadius: 50,
    },
    invoiceTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    invoiceAmount: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalValue: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
    },
    confirmButton: {
        marginTop: "auto",
        borderRadius: 16,
    },
    confirmContent: {
        paddingVertical: 6,
    },
    successSheet: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        marginTop: "auto",
        gap: 16,
    },
    sheetHandle: {
        width: 48,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#E5E7EB",
        alignSelf: "center",
    },
    successHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    checkWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#22C55E",
        alignItems: "center",
        justifyContent: "center",
    },
    successTitle: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 16,
    },
    successSubtitle: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    receiptCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amountLabel: {
        color: theme.colors.onSurface,
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    amountValue: {
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: 20,
    },
    metaStrong: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    doneButton: {
        borderRadius: 16,
    },
});

export default MakePaymentScreen;
