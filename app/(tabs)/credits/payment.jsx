import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    IconButton,
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

    const invoices = customer.invoices.map((inv) => ({
        ...inv,
        selected: selected.includes(inv.id),
        invoiceNo: `Inv #${inv.id.replace("i", "10")}`,
    }));

    return (
        <Screen contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="titleMedium" style={styles.title}>
                    Make Payment
                </Text>
                <IconButton icon="close" onPress={() => router.back()} />
            </View>

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
                    {selected.length} selected
                </Chip>
            </View>

            <Card style={styles.card}>
                <Card.Content style={{ gap: 12 }}>
                    {invoices.map((inv) => (
                        <View
                            key={inv.id}
                            style={[
                                styles.invoiceRow,
                                inv.selected && styles.invoiceRowActive,
                            ]}
                        >
                            <View style={styles.checkbox}>
                                <View
                                    style={[
                                        styles.checkboxInner,
                                        inv.selected && styles.checkboxSelected,
                                    ]}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.invoiceTitle}>
                                    {inv.invoiceNo} - {inv.title}
                                </Text>
                                <Text style={styles.meta}>{inv.date}</Text>
                            </View>
                            <Text style={styles.invoiceAmount}>
                                ETB {inv.amount.toLocaleString()}
                            </Text>
                        </View>
                    ))}
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
                onPress={() =>
                    router.push({
                        pathname: "/(tabs)/credits/payment-success",
                        params: { id: customer.id, amount },
                    })
                }
            >
                Confirm Payment
            </Button>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingBottom: 32,
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
        borderRadius: 16,
    },
    confirmContent: {
        paddingVertical: 6,
    },
});

export default MakePaymentScreen;
