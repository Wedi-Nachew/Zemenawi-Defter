import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import database from "../../../src/database";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";
import { getSalePaymentSummary } from "../../../src/services/creditService";
import { getSales } from "../../../src/services/saleService";
import theme from "../../../src/theme";
import {
    formatEthiopianDate,
    formatEthiopianTime,
} from "../../../src/utils/ethiopianCalendar";

const SalesScreen = () => {
    const { language } = useLanguage();
    const currencyPrefix = useMemo(() => i18n.t("common.currency.prefix"), []);
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(handle);
    }, [query]);

    const loadSales = useCallback(async () => {
        setLoading(true);
        try {
            setError("");
            const typeFilter =
                filter === "cash" || filter === "credit" ? filter : "all";
            const sales = await getSales({
                search: debouncedQuery,
                type: typeFilter,
            });

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
                    const dateLabel = formatEthiopianDate(soldAt.getTime());
                    const timeLabel = formatEthiopianTime(soldAt.getTime(), {
                        day: i18n.t("common.timePeriods.day"),
                        night: i18n.t("common.timePeriods.night"),
                    });
                    let status = "paid";
                    let tag = i18n.t("sales.tags.paid");

                    if (sale.type === "credit") {
                        const summary = await getSalePaymentSummary(
                            sale,
                            saleItems,
                        );
                        if (summary.remainingBalance > 0) {
                            status =
                                summary.initialPaid > 0 ? "partial" : "credit";
                            tag =
                                status === "partial"
                                    ? i18n.t("sales.tags.partial")
                                    : i18n.t("sales.tags.credit");
                        } else {
                            status = "paid";
                            tag = i18n.t("sales.tags.paid");
                        }
                    }

                    return {
                        id: sale.id,
                        customer:
                            customer?.name || i18n.t("home.customer.walkIn"),
                        amount,
                        profit,
                        tag,
                        status,
                        time: timeLabel,
                        receipt: sale.id.slice(0, 8).toUpperCase(),
                        dateLabel,
                    };
                }),
            );

            const filteredItems =
                filter === "partial"
                    ? items.filter((item) => item.status === "partial")
                    : filter === "credit"
                      ? items.filter((item) => item.status === "credit")
                      : items;

            const grouped = filteredItems.reduce((acc, item) => {
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
            setError(i18n.t("sales.errors.load"));
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, filter]);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    useEffect(() => {
        const salesCollection = database.collections.get("sales");
        const saleItemsCollection = database.collections.get("sale_items");
        const creditPaymentsCollection =
            database.collections.get("credit_payments");
        const creditPaymentItemsCollection = database.collections.get(
            "credit_payment_items",
        );

        const subscriptions = [
            salesCollection.query().observe(),
            saleItemsCollection.query().observe(),
            creditPaymentsCollection.query().observe(),
            creditPaymentItemsCollection.query().observe(),
        ].map((observable) => observable.subscribe(() => loadSales()));

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
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
                    headerTitle: i18n.t("sales.title"),
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
                    placeholder={i18n.t("sales.searchPlaceholder")}
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
                        {i18n.t("sales.filters.all")}
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
                        {i18n.t("sales.filters.cash")}
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
                        {i18n.t("sales.filters.credit")}
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
                        {i18n.t("sales.filters.partial")}
                    </Chip>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {!!error && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                    {loading && (
                        <View style={styles.emptyState}>
                            <ActivityIndicator animating />
                            <Text style={styles.meta}>
                                {i18n.t("sales.loading")}
                            </Text>
                        </View>
                    )}
                    {!loading && sections.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>
                                {i18n.t("sales.emptyTitle")}
                            </Text>
                            <Text style={styles.meta}>
                                {i18n.t("sales.emptySubtitle")}
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
                                                    {currencyPrefix}
                                                </Text>
                                                <Text
                                                    style={
                                                        item.profit >= 0
                                                            ? styles.profit
                                                            : styles.loss
                                                    }
                                                >
                                                    {item.profit >= 0
                                                        ? `${i18n.t("sales.profitLabel")} ${currencyPrefix} ${item.profit.toLocaleString()}`
                                                        : `${i18n.t("sales.lossLabel")} ${currencyPrefix} ${Math.abs(item.profit).toLocaleString()}`}
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
        // paddingBottom: 32,
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
    errorBanner: {
        backgroundColor: "#FEE2E2",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#FCA5A5",
        marginBottom: 12,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
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
