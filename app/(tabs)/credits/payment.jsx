import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
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
import theme from "../../../src/theme";

const creditCatalog = {
    c1: {
        id: "c1",
        name: "Abebe Kebede",
        balance: 12500,
        invoices: [
            {
                id: "i1",
                title: "Sugar 50kg",
                date: "Sep 12, 2023",
                amount: 2000,
            },
            { id: "i2", title: "Oil 5L", date: "Sep 15, 2023", amount: 850 },
            {
                id: "i3",
                title: "Pasta Pack x24",
                date: "Oct 01, 2023",
                amount: 1200,
            },
        ],
    },
    c2: {
        id: "c2",
        name: "Sara Tesfaye",
        balance: 8200,
        invoices: [
            {
                id: "i4",
                title: "Flour (25kg)",
                date: "Oct 11, 2023",
                amount: 3000,
            },
            {
                id: "i5",
                title: "Harar Coffee",
                date: "Oct 21, 2023",
                amount: 5200,
            },
        ],
    },
};

const MakePaymentScreen = () => {
    const { id } = useLocalSearchParams();
    const customer = useMemo(
        () => (typeof id === "string" ? creditCatalog[id] : undefined),
        [id],
    );

    const [amount, setAmount] = useState("2850");
    const [mode, setMode] = useState("auto");
    const [selected, setSelected] = useState(["i1", "i2"]);
    const [showSuccess, setShowSuccess] = useState(false);

    const receipt = useMemo(
        () => `#ZD-${Math.floor(8000 + Math.random() * 999)}`,
        [showSuccess],
    );

    // Always define invoices, parsedAmount, and autoSelected hooks before any early return
    const invoices = useMemo(() => {
        if (!customer) return [];
        return customer.invoices.map((inv) => ({
            ...inv,
            invoiceNo: `Inv #${inv.id.replace("i", "10")}`,
        }));
    }, [customer]);

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

    if (!customer) {
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
                        <Text style={styles.meta}>Customer not found.</Text>
                    </Card.Content>
                </Card>
            </Screen>
        );
    }

    const activeSelected = mode === "auto" ? autoSelected : selected;

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
                    {invoices.map((inv) => {
                        const isSelected = activeSelected.includes(inv.id);
                        return (
                            <Pressable
                                key={inv.id}
                                onPress={() => {
                                    if (mode !== "select") return;
                                    setSelected((prev) =>
                                        prev.includes(inv.id)
                                            ? prev.filter((id) => id !== inv.id)
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

            <Button
                mode="contained"
                icon="arrow-right"
                contentStyle={styles.confirmContent}
                style={styles.confirmButton}
                onPress={() => setShowSuccess(true)}
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
                                    ETB {parsedAmount.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Receipt No</Text>
                                <Text style={styles.metaStrong}>{receipt}</Text>
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
                                    Feb 03, 2026 • 4:30 PM
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>
                                    Remaining Balance
                                </Text>
                                <Text style={styles.metaStrong}>
                                    ETB {customer?.balance?.toLocaleString()}
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
