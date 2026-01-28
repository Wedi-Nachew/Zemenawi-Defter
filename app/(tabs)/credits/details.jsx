import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, Icon, IconButton, Text } from "react-native-paper";
import InitialAvatar from "../../../src/components/InitialAvatar";
import Screen from "../../../src/components/Screen";
import theme from "../../../src/theme";

const creditCatalog = {
    c1: {
        id: "c1",
        name: "Abebe Kebede",
        phone: "+251 911 234 567",
        balance: 12500,
        unpaidItems: [
            {
                id: "u1",
                title: "Teff Flour (10kg)",
                qty: 2,
                date: "Oct 24, 2023",
                amount: 2500,
            },
            {
                id: "u2",
                title: "Cooking Oil (5L)",
                qty: 3,
                date: "Oct 20, 2023",
                amount: 6000,
            },
            {
                id: "u3",
                title: "Sugar (10kg)",
                qty: 5,
                date: "Oct 15, 2023",
                amount: 4000,
            },
        ],
        payments: [
            { id: "p1", date: "Oct 18, 2023", amount: 2000 },
            { id: "p2", date: "Oct 05, 2023", amount: 1500 },
        ],
    },
    c2: {
        id: "c2",
        name: "Sara Tesfaye",
        phone: "+251 912 345 678",
        balance: 8200,
        unpaidItems: [
            {
                id: "u4",
                title: "Harar Coffee",
                qty: 4,
                date: "Oct 21, 2023",
                amount: 5200,
            },
            {
                id: "u5",
                title: "Flour (25kg)",
                qty: 1,
                date: "Oct 11, 2023",
                amount: 3000,
            },
        ],
        payments: [{ id: "p3", date: "Oct 02, 2023", amount: 1000 }],
    },
    c3: {
        id: "c3",
        name: "Restaurant Tana",
        phone: "+251 911 889 900",
        balance: 1500,
        unpaidItems: [
            {
                id: "u6",
                title: "Mineral Water",
                qty: 5,
                date: "Oct 22, 2023",
                amount: 1500,
            },
        ],
        payments: [{ id: "p4", date: "Oct 10, 2023", amount: 700 }],
    },
    c4: {
        id: "c4",
        name: "Dawit Meles",
        phone: "+251 900 112 233",
        balance: 0,
        unpaidItems: [],
        payments: [{ id: "p5", date: "Oct 25, 2023", amount: 500 }],
    },
};

const CreditDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const [tab, setTab] = useState("unpaid");

    const customer = useMemo(
        () => (typeof id === "string" ? creditCatalog[id] : undefined),
        [id],
    );

    if (!customer) {
        return (
            <Screen contentContainerStyle={styles.container}>
                <View style={styles.headerRow}>
                    <IconButton
                        icon="arrow-left"
                        onPress={() => router.back()}
                    />
                    <Text variant="titleMedium" style={styles.title}>
                        Credit Details
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <Card style={styles.card}>
                    <Card.Content style={{ gap: 8 }}>
                        <Text style={styles.title}>Customer not found</Text>
                        <Text style={styles.meta}>
                            Select a customer from credits to view details.
                        </Text>
                        <Button mode="contained" onPress={() => router.back()}>
                            Back to credits
                        </Button>
                    </Card.Content>
                </Card>
            </Screen>
        );
    }

    return (
        <Screen contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="titleMedium" style={styles.title}>
                    {customer.name}
                </Text>
                <IconButton icon="dots-horizontal" onPress={() => {}} />
            </View>

            <View style={styles.profileCard}>
                <InitialAvatar name={customer.name} size={72} />
                <Text style={styles.profileName}>{customer.name}</Text>
                <Text style={styles.meta}>Total Outstanding Balance</Text>
                <Text style={styles.balanceValue}>
                    ETB {customer.balance.toLocaleString()}
                </Text>
                <View style={styles.profileMetaRow}>
                    <Icon
                        source="phone"
                        size={14}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.meta}>{customer.phone}</Text>
                </View>
            </View>

            <View style={styles.tabRow}>
                <Chip
                    selected={tab === "unpaid"}
                    onPress={() => setTab("unpaid")}
                    mode={tab === "unpaid" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    style={[
                        styles.tabChip,
                        tab === "unpaid" && styles.tabChipActive,
                    ]}
                    textStyle={{
                        color: tab === "unpaid" ? "#FFFFFF" : theme.colors.text,
                    }}
                >
                    Unpaid Items
                </Chip>
                <Chip
                    selected={tab === "payments"}
                    onPress={() => setTab("payments")}
                    mode={tab === "payments" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    style={[
                        styles.tabChip,
                        tab === "payments" && styles.tabChipActive,
                    ]}
                    textStyle={{
                        color:
                            tab === "payments" ? "#FFFFFF" : theme.colors.text,
                    }}
                >
                    Payment History
                </Chip>
            </View>

            {tab === "unpaid" && (
                <View style={{ gap: 12 }}>
                    {customer.unpaidItems.length === 0 && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.meta}>
                                    No unpaid items.
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                    {customer.unpaidItems.map((item) => (
                        <Card key={item.id} style={styles.card}>
                            <Card.Content style={styles.itemRow}>
                                <View style={styles.itemIcon}>
                                    <Icon
                                        source="cube-outline"
                                        size={18}
                                        color={theme.colors.primary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemTitle}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.meta}>
                                        Qty {item.qty} • {item.date}
                                    </Text>
                                </View>
                                <Text style={styles.itemAmount}>
                                    ETB {item.amount.toLocaleString()}
                                </Text>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            )}

            {tab === "payments" && (
                <View style={{ gap: 12 }}>
                    {customer.payments.length === 0 && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.meta}>
                                    No payments recorded.
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                    {customer.payments.map((payment) => (
                        <Card key={payment.id} style={styles.card}>
                            <Card.Content style={styles.paymentRow}>
                                <View style={styles.itemIcon}>
                                    <Icon
                                        source="cash"
                                        size={18}
                                        color={theme.colors.secondary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemTitle}>
                                        Payment received
                                    </Text>
                                    <Text style={styles.meta}>
                                        {payment.date}
                                    </Text>
                                </View>
                                <Text style={styles.itemAmount}>
                                    ETB {payment.amount.toLocaleString()}
                                </Text>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            )}

            <Button
                mode="contained"
                icon="wallet"
                style={styles.actionButton}
                onPress={() =>
                    router.push({
                        pathname: "/(tabs)/credits/payment",
                        params: { id: customer.id },
                    })
                }
            >
                Receive Payment
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
    },
    profileCard: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        padding: 16,
        gap: 6,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    profileName: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 18,
        marginTop: 4,
    },
    balanceValue: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 22,
    },
    profileMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    tabRow: {
        flexDirection: "row",
        gap: 8,
    },
    tabChip: {
        borderRadius: 999,
        flex: 1,
    },
    tabChipActive: {
        backgroundColor: theme.colors.primary,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    itemIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primaryContainer,
    },
    itemTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    itemAmount: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    paymentRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    actionButton: {
        borderRadius: 16,
    },
});

export default CreditDetailsScreen;
