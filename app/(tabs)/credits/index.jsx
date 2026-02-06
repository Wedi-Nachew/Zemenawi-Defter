import { router, Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    IconButton,
    Searchbar,
    Text,
} from "react-native-paper";
import InitialAvatar from "../../../src/components/InitialAvatar";
import Screen from "../../../src/components/Screen";
import database from "../../../src/database";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";
import { getCustomersWithBalances } from "../../../src/services/creditService";
import theme from "../../../src/theme";

const CustomerCreditsScreen = () => {
    const { language } = useLanguage();
    const currencyPrefix = useMemo(
        () => i18n.t("common.currency.prefix"),
        [language],
    );
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState("");

    const loadCustomers = useCallback(async () => {
        let active = true;
        setLoading(true);
        try {
            setError("");
            const rows = await getCustomersWithBalances({
                search: query,
                filter,
            });
            if (!active) return;
            setCustomers(
                rows.map(({ customer, balance }) => ({
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone || "",
                    balance,
                })),
            );
        } catch (error) {
            console.error("Failed to load customers", error);
            if (active) setError(i18n.t("credits.errors.loadCustomers"));
        } finally {
            if (active) setLoading(false);
        }

        return () => {
            active = false;
        };
    }, [filter, query]);

    useEffect(() => {
        const cleanup = loadCustomers();
        return () => {
            if (typeof cleanup === "function") cleanup();
        };
    }, [loadCustomers]);

    useEffect(() => {
        const customersCollection = database.collections.get("customers");
        const salesCollection = database.collections.get("sales");
        const saleItemsCollection = database.collections.get("sale_items");
        const creditPaymentsCollection =
            database.collections.get("credit_payments");
        const creditPaymentItemsCollection = database.collections.get(
            "credit_payment_items",
        );

        const subscriptions = [
            customersCollection.query().observe(),
            salesCollection.query().observe(),
            saleItemsCollection.query().observe(),
            creditPaymentsCollection.query().observe(),
            creditPaymentItemsCollection.query().observe(),
        ].map((observable) => observable.subscribe(() => loadCustomers()));

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [loadCustomers]);

    const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);

    const filteredCustomers = useMemo(() => customers, [customers]);

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: i18n.t("credits.title"),
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
                <Card style={styles.summaryCard}>
                    <Card.Content style={styles.summaryContent}>
                        <View style={{ gap: 6 }}>
                            <Text style={styles.summaryLabel}>
                                {i18n.t("credits.summaryTotal")}
                            </Text>
                            <Text
                                variant="headlineMedium"
                                style={styles.summaryValue}
                            >
                                {currencyPrefix}{" "}
                                {totalOutstanding.toLocaleString()}
                            </Text>
                        </View>
                        <Button mode="contained" compact onPress={() => {}}>
                            {i18n.t("credits.actions.viewHistory")}
                        </Button>
                    </Card.Content>
                </Card>

                <Searchbar
                    value={query}
                    onChangeText={setQuery}
                    placeholder={i18n.t("credits.searchPlaceholder")}
                    style={styles.search}
                    inputStyle={{ fontSize: 15 }}
                    iconColor={theme.colors.onSurface}
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
                        {i18n.t("credits.filters.all")}
                    </Chip>
                    <Chip
                        selected={filter === "balance"}
                        onPress={() => setFilter("balance")}
                        mode={filter === "balance" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "balance"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "balance" && styles.filterChipActive,
                        ]}
                    >
                        {i18n.t("credits.filters.hasBalance")}
                    </Chip>
                    <Chip
                        selected={filter === "paid"}
                        onPress={() => setFilter("paid")}
                        mode={filter === "paid" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "paid"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "paid" && styles.filterChipActive,
                        ]}
                    >
                        {i18n.t("credits.filters.paidOff")}
                    </Chip>
                </View>

                {loading ? (
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <ActivityIndicator />
                            <Text style={styles.meta}>
                                {i18n.t("credits.loading")}
                            </Text>
                        </Card.Content>
                    </Card>
                ) : error ? (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.errorText}>{error}</Text>
                        </Card.Content>
                    </Card>
                ) : filteredCustomers.length === 0 ? (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.meta}>
                                {i18n.t("credits.empty")}
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    <FlatList
                        data={filteredCustomers}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ gap: 12, paddingBottom: 28 }}
                        renderItem={({ item }) => (
                            <Card
                                style={styles.card}
                                onPress={() =>
                                    router.push({
                                        pathname: "/(tabs)/credits/details",
                                        params: { id: item.id },
                                    })
                                }
                            >
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.customerRow}>
                                        <InitialAvatar size={40} />
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                variant="titleMedium"
                                                style={styles.cardTitle}
                                            >
                                                {item.name}
                                            </Text>
                                            <Text style={styles.subtitle}>
                                                {item.phone}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                alignItems: "flex-end",
                                                gap: 6,
                                            }}
                                        >
                                            <Text style={styles.balanceValue}>
                                                {currencyPrefix}{" "}
                                                {item.balance.toLocaleString()}
                                            </Text>
                                            <Chip
                                                compact
                                                mode="outlined"
                                                style={
                                                    item.balance > 0
                                                        ? styles.balanceChip
                                                        : styles.paidChip
                                                }
                                                textStyle={{
                                                    color:
                                                        item.balance > 0
                                                            ? theme.colors.error
                                                            : theme.colors
                                                                  .secondary,
                                                }}
                                            >
                                                {item.balance > 0
                                                    ? i18n.t(
                                                          "credits.status.hasBalance",
                                                      )
                                                    : i18n.t(
                                                          "credits.status.paid",
                                                      )}
                                            </Chip>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        )}
                    />
                )}
            </Screen>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 14,
        paddingTop: 6,
        paddingBottom: 24,
    },

    title: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    meta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    subtitle: {
        color: theme.colors.onSurface,
    },
    summaryCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: 18,
        elevation: 0,
    },
    summaryContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryLabel: {
        color: "#E0EAFF",
        fontSize: 12,
        fontWeight: "600",
    },
    summaryValue: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    search: {
        borderRadius: theme.roundness,
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
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    cardContent: {
        gap: 10,
    },
    customerRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    cardTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    balanceValue: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
    },
    balanceChip: {
        borderColor: "#FEE2E2",
        backgroundColor: "#FEE2E2",
    },
    paidChip: {
        borderColor: "#DCFCE7",
        backgroundColor: "#DCFCE7",
    },
});

export default CustomerCreditsScreen;
