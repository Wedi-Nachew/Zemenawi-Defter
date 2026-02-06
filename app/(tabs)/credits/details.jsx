import { Q } from "@nozbe/watermelondb";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Icon,
    Text,
} from "react-native-paper";
import InitialAvatar from "../../../src/components/InitialAvatar";
import Screen from "../../../src/components/Screen";
import database from "../../../src/database";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";
import {
    getCustomerById,
    getCustomerPayments,
    getCustomerUnpaidItems,
} from "../../../src/services/creditService";
import theme from "../../../src/theme";

const CreditDetailsScreen = () => {
    const { language } = useLanguage();
    const locale = language === "ti" ? "ti-ET" : "en";
    const currencyPrefix = i18n.t("common.currency.prefix");
    const { id } = useLocalSearchParams();
    const [tab, setTab] = useState("unpaid");
    const [customer, setCustomer] = useState(null);
    const [unpaidItems, setUnpaidItems] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const isMounted = useRef(true);

    const loadCustomer = useCallback(async () => {
        if (typeof id !== "string") return;
        setLoading(true);
        try {
            const record = await getCustomerById(id);
            const unpaid = await getCustomerUnpaidItems(record);
            const enriched = await Promise.all(
                unpaid.map(async (entry) => {
                    const product = await entry.saleItem.product.fetch();
                    return {
                        id: entry.saleItem.id,
                        title: product?.name || i18n.t("common.labels.item"),
                        qty: entry.saleItem.quantity,
                        date: entry.sale?.soldAt
                            ? new Date(entry.sale.soldAt).toLocaleDateString(
                                  locale,
                              )
                            : "",
                        amount: entry.remainingBalance,
                        saleItem: entry.saleItem,
                    };
                }),
            );
            const paymentRows = await getCustomerPayments(id, 30);
            const mappedPayments = paymentRows.map((payment) => ({
                id: payment.id,
                date: payment.paidAt
                    ? new Date(payment.paidAt).toLocaleDateString(locale)
                    : "",
                amount: payment.totalAmount,
                receiptNo: payment.receiptNo || "-",
            }));

            if (!isMounted.current) return;
            setCustomer({
                id: record.id,
                name: record.name,
                phone: record.phone || "",
            });
            setUnpaidItems(enriched);
            setPayments(mappedPayments);
        } catch (error) {
            console.error("Failed to load credit details", error);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [id, language]);

    useEffect(() => {
        isMounted.current = true;
        loadCustomer();
        return () => {
            isMounted.current = false;
        };
    }, [loadCustomer]);

    useEffect(() => {
        if (typeof id !== "string") return;
        const salesCollection = database.collections.get("sales");
        const saleItemsCollection = database.collections.get("sale_items");
        const creditPaymentsCollection =
            database.collections.get("credit_payments");
        const creditPaymentItemsCollection = database.collections.get(
            "credit_payment_items",
        );

        const subscriptions = [
            salesCollection.query(Q.where("customer_id", id)).observe(),
            saleItemsCollection
                .query(Q.on("sales", "customer_id", id))
                .observe(),
            creditPaymentsCollection
                .query(Q.where("customer_id", id))
                .observe(),
            creditPaymentItemsCollection
                .query(Q.on("credit_payments", "customer_id", id))
                .observe(),
        ].map((observable) => observable.subscribe(() => loadCustomer()));

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [id, loadCustomer]);

    const balance = useMemo(
        () => unpaidItems.reduce((sum, item) => sum + item.amount, 0),
        [unpaidItems],
    );

    if (loading || !customer) {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerTitle: i18n.t("credits.details.title"),
                        headerTitleStyle: {
                            fontWeight: "700",
                            fontSize: 20,
                        },
                        headerTitleAlign: "center",
                    }}
                />
                <Screen style={styles.container}>
                    <Card style={styles.card}>
                        <Card.Content style={{ gap: 8 }}>
                            <Text style={styles.title}>
                                {loading
                                    ? i18n.t("credits.details.loadingCustomer")
                                    : i18n.t(
                                          "credits.details.customerNotFound",
                                      )}
                            </Text>
                            <Text style={styles.meta}>
                                {loading
                                    ? i18n.t("credits.details.fetchingDetails")
                                    : i18n.t(
                                          "credits.details.selectCustomerPrompt",
                                      )}
                            </Text>
                            {loading && <ActivityIndicator />}
                            {!loading && (
                                <Button
                                    mode="contained"
                                    onPress={() => router.back()}
                                >
                                    {i18n.t("credits.details.backToCredits")}
                                </Button>
                            )}
                        </Card.Content>
                    </Card>
                </Screen>
            </>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: customer.name,
                    headerTitleStyle: {
                        fontWeight: "700",
                        fontSize: 20,
                    },
                    headerTitleAlign: "center",
                }}
            />
            <Screen contentContainerStyle={styles.container}>
                <View style={styles.profileCard}>
                    <InitialAvatar size={72} />
                    <Text style={styles.profileName}>{customer.name}</Text>
                    <Text style={styles.meta}>
                        {i18n.t("credits.details.totalOutstanding")}
                    </Text>
                    <Text style={styles.balanceValue}>
                        {currencyPrefix} {balance.toLocaleString()}
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
                            color:
                                tab === "unpaid"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                    >
                        {i18n.t("credits.details.unpaidItems")}
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
                                tab === "payments"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                    >
                        {i18n.t("credits.details.paymentHistory")}
                    </Chip>
                </View>

                {tab === "unpaid" && (
                    <ScrollView contentContainerStyle={{ gap: 12 }}>
                        {unpaidItems.length === 0 && (
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={styles.meta}>
                                        {i18n.t("credits.details.noUnpaid")}
                                    </Text>
                                </Card.Content>
                            </Card>
                        )}
                        {unpaidItems.map((item) => (
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
                                            {i18n.t("credits.details.qty")}{" "}
                                            {item.qty} • {item.date}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemAmount}>
                                        {currencyPrefix}{" "}
                                        {item.amount.toLocaleString()}
                                    </Text>
                                </Card.Content>
                            </Card>
                        ))}
                    </ScrollView>
                )}

                {tab === "payments" && (
                    <ScrollView contentContainerStyle={{ gap: 12 }}>
                        {payments.length === 0 && (
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={styles.meta}>
                                        {i18n.t("credits.details.noPayments")}
                                    </Text>
                                </Card.Content>
                            </Card>
                        )}
                        {payments.map((payment) => (
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
                                            {i18n.t(
                                                "credits.details.paymentReceived",
                                            )}
                                        </Text>
                                        <Text style={styles.meta}>
                                            {payment.date}
                                        </Text>
                                        <Text style={styles.meta}>
                                            {i18n.t(
                                                "credits.details.receiptLabel",
                                            )}{" "}
                                            {payment.receiptNo}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemAmount}>
                                        {currencyPrefix}{" "}
                                        {payment.amount.toLocaleString()}
                                    </Text>
                                </Card.Content>
                            </Card>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.actionButtonContainer}>
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
                        {i18n.t("credits.actions.receivePayment")}
                    </Button>
                </View>
            </Screen>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingBottom: 32,
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
        marginVertical: 16,
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
    actionButtonContainer: {
        marginTop: 8,
    },
    actionButton: {
        borderRadius: 16,
    },
});

export default CreditDetailsScreen;
