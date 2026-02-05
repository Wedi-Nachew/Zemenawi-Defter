import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import LowStockAlert from "../../src/components/LowStockAlert";
import RecentSaleItem from "../../src/components/RecentSaleItem";
import ScrollScreen from "../../src/components/ScrollScreen";
import StatCard from "../../src/components/StatCard";
import { getDashboardSummary } from "../../src/services/reportingService";
import theme from "../../src/theme";

const HomeScreen = () => {
    const [stats, setStats] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [error, setError] = useState("");
    const quickActions = useMemo(
        () => [
            {
                label: "New Sale",
                icon: "cart-check",
                mode: "contained",
                color: theme.colors.primary,
                routeTo: "(tabs)/sales/new",
            },
            {
                label: "Add Product",
                icon: "plus-circle",
                mode: "outlined",
                color: theme.colors.primary,
                routeTo: "(tabs)/inventory/new",
            },
        ],
        [],
    );

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                setError("");
                const summary = await getDashboardSummary({
                    lowStockThreshold: 5,
                    recentLimit: 5,
                });

                if (!active) return;

                setStats([
                    {
                        label: "Total Products",
                        value: summary.totalProducts.toLocaleString(),
                        icon: "cube-outline",
                        color: theme.colors.primary,
                    },
                    {
                        label: "Today’s Sales",
                        value: `ETB ${summary.todaySalesTotal.toLocaleString()}`,
                        icon: "cash-multiple",
                        color: theme.colors.secondary,
                    },
                    {
                        label: "Outstanding Credit",
                        value: `ETB ${summary.outstandingCredit.toLocaleString()}`,
                        icon: "wallet-outline",
                        color: theme.colors.warning,
                    },
                ]);

                const lowStock = summary.lowStockProducts.map((product) => ({
                    id: product.id,
                    name: product.name,
                    stock: `${product.stock} left`,
                    icon: "cube-outline",
                    iconColor: theme.colors.warning,
                    iconBg: "#FEF3C7",
                }));

                const recent = await Promise.all(
                    summary.recentSales.map(async (sale) => {
                        const items = await sale.saleItems.fetch();
                        const amount = items.reduce(
                            (sum, item) =>
                                sum + item.quantity * item.sellingPrice,
                            0,
                        );
                        const customer = sale.customerId
                            ? await sale.customer.fetch()
                            : null;
                        const soldAt = sale.soldAt
                            ? new Date(sale.soldAt)
                            : new Date();
                        const timeLabel = soldAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        return {
                            id: sale.id,
                            customerName: customer?.name || "Walk-in",
                            amount,
                            time: timeLabel,
                            type: sale.type,
                        };
                    }),
                );

                if (!active) return;
                setLowStockItems(lowStock);
                setRecentSales(recent);
            } catch (error) {
                console.error("Failed to load dashboard", error);
                if (active) {
                    setError("Unable to load dashboard data.");
                }
            }
        };

        loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    return (
        <ScrollScreen style={styles.container}>
            {!!error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
            <View style={styles.statsRow}>
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </View>

            <View style={styles.actionsRow}>
                {quickActions.map((action) => (
                    <Button
                        key={action.label}
                        mode={action.mode}
                        icon="plus"
                        buttonColor={
                            action.mode === "contained"
                                ? action.color
                                : "#FFFFFF"
                        }
                        textColor={
                            action.mode === "contained"
                                ? "#FFFFFF"
                                : action.color
                        }
                        style={[
                            styles.actionButton,
                            action.mode === "contained"
                                ? styles.actionFilled
                                : styles.actionOutlined,
                        ]}
                        contentStyle={styles.actionContent}
                        labelStyle={styles.actionLabel}
                        onPress={() => router.push(action.routeTo)}
                    >
                        {action.label}
                    </Button>
                ))}
            </View>

            {lowStockItems.length > 0 ? (
                <LowStockAlert items={lowStockItems} />
            ) : (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No low stock items</Text>
                    <Text style={styles.emptySubtitle}>
                        All products are above the low stock threshold.
                    </Text>
                </View>
            )}

            <View>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.recentListTitle}>Recent Sales</Text>
                    </View>
                    <Button
                        mode="text"
                        onPress={() => router.push("(tabs)/sales")}
                        labelStyle={styles.seeAllLabel}
                        compact
                    >
                        See All
                    </Button>
                </View>
                {recentSales.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>No recent sales</Text>
                        <Text style={styles.emptySubtitle}>
                            Sales will appear here once recorded.
                        </Text>
                    </View>
                ) : (
                    recentSales.map((sale) => (
                        <RecentSaleItem key={sale.id} {...sale} />
                    ))
                )}
            </View>
        </ScrollScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },

    subtitle: {
        color: theme.colors.onSurface,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 22,
        overflow: "hidden",
    },
    actionFilled: {
        borderWidth: 0,
    },
    actionOutlined: {
        borderWidth: 1,
        borderColor: "#E1E7F0",
        backgroundColor: "#FFFFFF",
    },
    actionContent: {
        height: 52,
    },
    actionLabel: {
        fontWeight: "700",
        letterSpacing: 0,
    },
    sectionCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        elevation: 1,
    },
    subtitleText: {
        color: theme.colors.onSurface,
    },
    recentList: {
        gap: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    recentListTitle: {
        color: theme.colors.text,
        fontWeight: "bold",
        marginLeft: 8,
        fontSize: 20,
    },
    seeAllLabel: {
        fontSize: 14,
        color: "#2563EB",
    },
    emptyCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    emptyTitle: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 14,
    },
    emptySubtitle: {
        color: theme.colors.onSurface,
        marginTop: 4,
        fontSize: 12,
    },
    errorBanner: {
        backgroundColor: "#FEE2E2",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#FCA5A5",
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
    },
});

export default HomeScreen;
