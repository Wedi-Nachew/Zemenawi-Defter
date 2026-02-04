import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import LowStockAlert from "../../src/components/LowStockAlert";
import RecentSaleItem from "../../src/components/RecentSaleItem";
import ScrollScreen from "../../src/components/ScrollScreen";
import StatCard from "../../src/components/StatCard";
import theme from "../../src/theme";

const HomeScreen = () => {
    const { stats, lowStockItems, recentSales, quickActions } = useMemo(
        () => ({
            stats: [
                {
                    label: "Total Products",
                    value: "128",
                    icon: "cube-outline",
                    color: theme.colors.primary,
                },
                {
                    label: "Today’s Sales",
                    value: "24,500 ETB",
                    icon: "cash-multiple",
                    color: theme.colors.secondary,
                },
                {
                    label: "Outstanding Credit",
                    value: "72,300 ETB",
                    icon: "wallet-outline",
                    color: theme.colors.warning,
                },
            ],
            lowStockItems: [
                {
                    id: "1",
                    name: "Harar Coffee",
                    stock: "3 left",
                    icon: "coffee",
                    iconColor: theme.colors.warning,
                    iconBg: "#FEF3C7",
                },
                {
                    id: "2",
                    name: "Flour (25kg)",
                    stock: "1 left",
                    icon: "bag-personal",
                    iconColor: theme.colors.error,
                    iconBg: "#FEE2E2",
                },
                {
                    id: "3",
                    name: "Mineral Water",
                    stock: "5 left",
                    icon: "water",
                    iconColor: theme.colors.primary,
                    iconBg: "#DBEAFE",
                },
            ],
            recentSales: [
                {
                    id: "1",
                    customerName: "Abeba Store",
                    amount: 3200,
                    time: "10:45",
                    type: "cash",
                },
                {
                    id: "2",
                    customerName: "Samson Bakery",
                    amount: 11800,
                    time: "09:30",
                    type: "credit",
                },
                {
                    id: "3",
                    customerName: "Walk-in",
                    amount: 450,
                    time: "Yesterday",
                    type: "cash",
                },
                {
                    id: "4",
                    customerName: "Tesfaye Mini",
                    amount: 2100,
                    time: "Yesterday",
                    type: "credit",
                },
            ],
            quickActions: [
                {
                    label: "New Sale",
                    icon: "cart-check",
                    mode: "contained",
                    color: theme.colors.primary,
                },
                {
                    label: "Add Product",
                    icon: "plus-circle",
                    mode: "outlined",
                    color: theme.colors.primary,
                },
            ],
        }),
        [],
    );

    return (
        <ScrollScreen style={styles.container}>
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
                        onPress={() => {}}
                    >
                        {action.label}
                    </Button>
                ))}
            </View>

            <LowStockAlert items={lowStockItems} />

            <View>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.recentListTitle}>Recent Sales</Text>
                    </View>
                    <Button
                        mode="text"
                        onPress={() => {}}
                        labelStyle={styles.seeAllLabel}
                        compact
                    >
                        See All
                    </Button>
                </View>
                {recentSales.map((sale) => (
                    <RecentSaleItem key={sale.id} {...sale} />
                ))}
            </View>
        </ScrollScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        // paddingBottom: 28,
        // paddingVertical: 12,
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
});

export default HomeScreen;
