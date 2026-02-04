import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Divider,
    Icon,
    IconButton,
    Text,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import theme from "../../../src/theme";

const salesCatalog = {
    s1: {
        id: "s1",
        customer: "Abebe Kebede",
        receipt: "#ZM-9042",
        status: "credit",
        time: "Oct 24 • 10:30 AM",
        paymentMethod: "Credit",
        paidAmount: 2000,
        items: [
            {
                id: "i1",
                name: "Teff Flour (10kg)",
                qty: 1,
                price: 1200,
                cost: 900,
            },
            {
                id: "i2",
                name: "Cooking Oil (5L)",
                qty: 2,
                price: 950,
                cost: 700,
            },
        ],
    },
    s2: {
        id: "s2",
        customer: "Walking Customer",
        receipt: "#ZM-9041",
        status: "paid",
        time: "Oct 24 • 09:15 AM",
        paymentMethod: "Cash",
        paidAmount: 1200,
        items: [
            { id: "i3", name: "Mineral Water", qty: 4, price: 300, cost: 220 },
        ],
    },
    s3: {
        id: "s3",
        customer: "Selamawit G.",
        receipt: "#ZM-9038",
        status: "partial",
        time: "Oct 23 • 04:15 PM",
        paymentMethod: "Credit",
        paidAmount: 5000,
        items: [
            { id: "i4", name: "Harar Coffee", qty: 3, price: 650, cost: 600 },
            { id: "i5", name: "Sunflower Oil", qty: 6, price: 180, cost: 200 },
        ],
    },
    s4: {
        id: "s4",
        customer: "Kaleb Tadesse",
        receipt: "#ZM-9035",
        status: "paid",
        time: "Oct 23 • 11:20 AM",
        paymentMethod: "Cash",
        paidAmount: 550,
        items: [{ id: "i6", name: "Spice Mix", qty: 1, price: 550, cost: 430 }],
    },
};

const SaleDetailsScreen = () => {
    const { id } = useLocalSearchParams();

    const sale = useMemo(
        () => (typeof id === "string" ? salesCatalog[id] : undefined),
        [id],
    );

    if (!sale) {
        return (
            <Screen contentContainerStyle={styles.container}>
                <View style={styles.headerRow}>
                    <IconButton
                        icon="arrow-left"
                        onPress={() => router.back()}
                    />
                    <Text variant="titleMedium" style={styles.title}>
                        Sale Details
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <Card style={styles.card}>
                    <Card.Content style={{ gap: 8 }}>
                        <Text style={styles.title}>Sale not found</Text>
                        <Text style={styles.meta}>
                            Select a sale from history to view details.
                        </Text>
                        <Button mode="contained" onPress={() => router.back()}>
                            Back to history
                        </Button>
                    </Card.Content>
                </Card>
            </Screen>
        );
    }

    const totals = sale.items.reduce(
        (acc, item) => {
            acc.total += item.qty * item.price;
            acc.cost += item.qty * (item.cost || 0);
            acc.items += item.qty;
            return acc;
        },
        { total: 0, cost: 0, items: 0 },
    );

    const balance = Math.max(totals.total - sale.paidAmount, 0);
    const profit = totals.total - totals.cost;
    const status = getStatusTone(sale.status);

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: sale.customer,
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
                                        {sale.customer}
                                    </Text>
                                    <Text style={styles.meta}>
                                        {sale.receipt} • {sale.time}
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
                                    ETB {totals.total.toLocaleString()}
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
                                        ? `ETB ${profit.toLocaleString()}`
                                        : `- ETB ${Math.abs(profit).toLocaleString()}`}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content style={{ gap: 10 }}>
                            <Text style={styles.sectionTitle}>Items</Text>
                            {sale.items.map((item, idx) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardTitle}>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.meta}>
                                            Qty {item.qty} • ETB{" "}
                                            {item.price.toLocaleString()}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemTotal}>
                                        ETB{" "}
                                        {(
                                            item.qty * item.price
                                        ).toLocaleString()}
                                    </Text>
                                    {idx < sale.items.length - 1 && (
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
                                    {sale.paymentMethod}
                                </Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.meta}>Paid</Text>
                                <Text style={styles.cardTitle}>
                                    ETB {sale.paidAmount.toLocaleString()}
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
                                    ETB {balance.toLocaleString()}
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
                                        ? `ETB ${profit.toLocaleString()}`
                                        : `- ETB ${Math.abs(profit).toLocaleString()}`}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <Card style={styles.summaryCard}>
                        <Card.Content style={styles.summaryRow}>
                            <View>
                                <Text style={styles.meta}>Items Count</Text>
                                <Text style={styles.cardTitle}>
                                    {totals.items} Units
                                </Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                                <Text style={styles.meta}>Total Payable</Text>
                                <Text style={styles.amountValue}>
                                    ETB {totals.total.toLocaleString()}
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
                        onPress={() => {}}
                    >
                        Edit Sale
                    </Button>
                    <Button
                        mode="outlined"
                        icon="trash-can-outline"
                        style={{ flex: 1, borderColor: theme.colors.error }}
                        onPress={() => {}}
                        labelStyle={{ color: theme.colors.error }}
                    >
                        Delete Sale
                    </Button>
                </View>
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
});

export default SaleDetailsScreen;
