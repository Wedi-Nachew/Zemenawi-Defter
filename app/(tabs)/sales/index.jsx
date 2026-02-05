import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Card,
    Chip,
    Icon,
    IconButton,
    Searchbar,
    Text,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import { getSales } from "../../../src/services/saleService";
import theme from "../../../src/theme";

const SalesScreen = () => {
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSales = useCallback(async () => {
        setLoading(true);
        try {
            const typeFilter =
                filter === "cash" || filter === "credit" ? filter : "all";
            const sales = await getSales({ search: query, type: typeFilter });

            const items = await Promise.all(
                sales.map(async (sale) => {
                    const saleItems = await sale.saleItems.fetch();
                    const amount = saleItems.reduce(
                        (sum, item) => sum + item.quantity * item.sellingPrice,
                        0,
                    );
                    const profit = saleItems.reduce(
                        (sum, item) =>
                            sum +
                            (item.sellingPrice - item.costPrice) *
                                item.quantity,
                        0,
                    );
                    const customer = sale.customerId
                        ? await sale.customer.fetch()
                        : null;
                    const soldAt = sale.soldAt
                        ? new Date(sale.soldAt)
                        : new Date();
                    const dateLabel = soldAt.toLocaleDateString();
                    const timeLabel = soldAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                    const status =
                        sale.type === "credit" && amount > 0
                            ? "credit"
                            : "paid";

                    return {
                        id: sale.id,
                        customer: customer?.name || "Walk-in",
                        amount,
                        profit,
                        tag: sale.type === "credit" ? "Credit" : "Paid",
                        status,
                        time: timeLabel,
                        receipt: sale.id.slice(0, 8).toUpperCase(),
                        dateLabel,
                    };
                }),
            );

            const grouped = items.reduce((acc, item) => {
                if (!acc[item.dateLabel]) acc[item.dateLabel] = [];
                acc[item.dateLabel].push(item);
                return acc;
            }, {});

            const nextSections = Object.entries(grouped).map(
                ([title, list]) => ({
                    title,
                    items: list,
                }),
            );

            setSections(nextSections);
        } catch (error) {
            console.error("Failed to load sales", error);
            setSections([]);
        } finally {
            setLoading(false);
        }
    }, [filter, query]);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    useFocusEffect(
        useCallback(() => {
            loadSales();
        }, [loadSales]),
    );

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: "Sales History",
                    headerTitleStyle: {
                        fontSize: 22,
                        fontWeight: "700",
                    },
                    headerRight: () => (
                        <IconButton
                            icon="plus"
                            mode="contained"
                            containerColor={theme.colors.primary}
                            iconColor="#FFFFFF"
                            size={22}
                            onPress={() => router.push("/(tabs)/sales/new")}
                        />
                    ),
                }}
            />
            <Screen style={styles.container}>
                <Searchbar
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search by customer..."
                    style={styles.search}
                    inputStyle={{ fontSize: 16 }}
                    iconColor={theme.colors.primary}
                />

                <View style={styles.filterRow}>
                    <Chip
                        selected={filter === "all"}
                        onPress={() => setFilter("all")}
                        mode={filter === "all" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "all"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "all" && styles.filterChipActive,
                        ]}
                    >
                        All
                    </Chip>
                    <Chip
                        selected={filter === "cash"}
                        onPress={() => setFilter("cash")}
                        mode={filter === "cash" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "cash"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "cash" && styles.filterChipActive,
                        ]}
                    >
                        Cash
                    </Chip>
                    <Chip
                        selected={filter === "credit"}
                        onPress={() => setFilter("credit")}
                        mode={filter === "credit" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "credit"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "credit" && styles.filterChipActive,
                        ]}
                    >
                        Credit
                    </Chip>
                    <Chip
                        selected={filter === "partial"}
                        onPress={() => setFilter("partial")}
                        mode={filter === "partial" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "partial"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "partial" && styles.filterChipActive,
                        ]}
                    >
                        Partial
                    </Chip>
                </View>

                <ScrollView>
                    {loading && (
                        <View style={styles.emptyState}>
                            <ActivityIndicator animating />
                            <Text style={styles.meta}>Loading sales…</Text>
                        </View>
                    )}
                    {!loading && sections.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>No sales yet</Text>
                            <Text style={styles.meta}>
                                Sales will appear here once recorded.
                            </Text>
                        </View>
                    )}
                    {sections.map((section) => (
                        <View key={section.title} style={{ gap: 12 }}>
                            <Text style={styles.sectionTitle}>
                                {section.title}
                            </Text>
                            {section.items.map((item) => {
                                const status = getStatusTone(item.status);
                                return (
                                    <Card
                                        key={item.id}
                                        style={styles.card}
                                        onPress={() =>
                                            router.push({
                                                pathname:
                                                    "/(tabs)/sales/details",
                                                params: { id: item.id },
                                            })
                                        }
                                    >
                                        <Card.Content style={styles.cardRow}>
                                            <View
                                                style={[
                                                    styles.avatar,
                                                    {
                                                        backgroundColor:
                                                            status.iconBg,
                                                    },
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
                                                    {item.customer}
                                                </Text>
                                                <Text style={styles.meta}>
                                                    {item.receipt} • {item.time}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    alignItems: "flex-end",
                                                    gap: 6,
                                                }}
                                            >
                                                <Text style={styles.amount}>
                                                    {item.amount.toLocaleString()}{" "}
                                                    ETB
                                                </Text>
                                                <Text
                                                    style={
                                                        item.profit >= 0
                                                            ? styles.profit
                                                            : styles.loss
                                                    }
                                                >
                                                    {item.profit >= 0
                                                        ? `Profit ETB ${item.profit.toLocaleString()}`
                                                        : `Loss ETB ${Math.abs(item.profit).toLocaleString()}`}
                                                </Text>
                                                <View
                                                    style={[
                                                        styles.statusPill,
                                                        {
                                                            backgroundColor:
                                                                status.pillBg,
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.statusText,
                                                            {
                                                                color: status.pillText,
                                                            },
                                                        ]}
                                                    >
                                                        {item.tag}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Icon
                                                source="chevron-right"
                                                color={theme.colors.onSurface}
                                                size={20}
                                            />
                                        </Card.Content>
                                    </Card>
                                );
                            })}
                        </View>
                    ))}
                </ScrollView>
            </Screen>
        </>
    );
};
// },
const getStatusTone = (status) => {
    if (status === "credit") {
        return {
            icon: "file-document-outline",
            iconBg: "#DBEAFE",
            iconColor: theme.colors.primary,
            pillBg: "#E0EAFF",
            pillText: theme.colors.primary,
        };
    }
    if (status === "partial") {
        return {
            icon: "account-alert-outline",
            iconBg: "#FEF3C7",
            iconColor: theme.colors.warning,
            pillBg: "#FEF3C7",
            pillText: theme.colors.warning,
        };
    }
    return {
        icon: "account-check-outline",
        iconBg: "#DCFCE7",
        iconColor: theme.colors.secondary,
        pillBg: "#DCFCE7",
        pillText: theme.colors.secondary,
    };
};

const styles = StyleSheet.create({
    container: {
        gap: 14,
        paddingBottom: 32,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    search: {
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginTop: 2,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
    },
    filterChip: {
        borderRadius: 999,
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
    },
    sectionTitle: {
        color: theme.colors.onSurface,
        fontWeight: "600",
        marginTop: 10,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    meta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    amount: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    profit: {
        color: theme.colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    loss: {
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: "600",
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
    emptyState: {
        paddingVertical: 24,
        alignItems: "center",
        gap: 10,
    },
    emptyTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
});

export default SalesScreen;
