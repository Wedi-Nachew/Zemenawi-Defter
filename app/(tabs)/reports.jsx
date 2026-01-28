import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Icon, IconButton, Text } from "react-native-paper";
import Screen from "../../src/components/Screen";
import theme from "../../src/theme";

const ReportsScreen = () => {
    const [range, setRange] = useState("month");
    const [filter, setFilter] = useState("all");

    const data = useMemo(
        () => ({
            profit: 45200,
            revenue: 118450,
            cogs: 73250,
            items: [
                {
                    id: "p1",
                    name: "Coca Cola 500ml (Crate)",
                    sold: 120,
                    revenue: 6000,
                    cogs: 4500,
                    stock: 24,
                },
                {
                    id: "p2",
                    name: "Sunflower Oil 5L",
                    sold: 45,
                    revenue: 38250,
                    cogs: 32000,
                    stock: 6,
                },
                {
                    id: "p3",
                    name: "Mama Pasta (Carton)",
                    sold: 200,
                    revenue: 120000,
                    cogs: 95000,
                    stock: 18,
                },
                {
                    id: "p4",
                    name: "Berbere Spice Mix (1kg)",
                    sold: 10,
                    revenue: 2500,
                    cogs: 3000,
                    stock: 2,
                },
            ],
        }),
        [],
    );

    const filteredItems = useMemo(() => {
        return data.items.filter((item) => {
            if (filter === "high") return item.revenue - item.cogs > 5000;
            if (filter === "low") return item.stock <= 5;
            return true;
        });
    }, [data.items, filter]);

    return (
        <Screen contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <Text variant="titleLarge" style={styles.title}>
                    Profit Analysis
                </Text>
                <IconButton icon="download" onPress={() => {}} />
            </View>

            <Card style={styles.rangeCard}>
                <Card.Content style={styles.rangeContent}>
                    <View style={styles.rangeLeft}>
                        <View style={styles.rangeIcon}>
                            <Icon
                                source="calendar"
                                size={18}
                                color={theme.colors.primary}
                            />
                        </View>
                        <View>
                            <Text style={styles.rangeLabel}>Time Period</Text>
                            <Text style={styles.rangeValue}>This Month</Text>
                        </View>
                    </View>
                    <Icon
                        source="chevron-down"
                        size={20}
                        color={theme.colors.onSurface}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
                <Card.Content style={{ gap: 12 }}>
                    <View style={styles.summaryTop}>
                        <View>
                            <Text style={styles.summaryLabel}>
                                Total Net Profit
                            </Text>
                            <Text style={styles.summaryValue}>
                                ETB {data.profit.toLocaleString()}
                            </Text>
                        </View>
                        <Chip
                            compact
                            style={styles.growthChip}
                            textStyle={styles.growthText}
                        >
                            +12%
                        </Chip>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryMeta}>
                            REV: ETB {data.revenue.toLocaleString()}
                        </Text>
                        <Text style={styles.summaryMeta}>
                            COGS: ETB {data.cogs.toLocaleString()}
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.filterRow}>
                <Chip
                    selected={filter === "all"}
                    onPress={() => setFilter("all")}
                    mode={filter === "all" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    textStyle={{
                        color: filter === "all" ? "#FFFFFF" : theme.colors.text,
                    }}
                    style={[
                        styles.filterChip,
                        filter === "all" && styles.filterChipActive,
                    ]}
                >
                    All items
                </Chip>
                <Chip
                    selected={filter === "high"}
                    onPress={() => setFilter("high")}
                    mode={filter === "high" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    textStyle={{
                        color:
                            filter === "high" ? "#FFFFFF" : theme.colors.text,
                    }}
                    style={[
                        styles.filterChip,
                        filter === "high" && styles.filterChipActive,
                    ]}
                >
                    High Margin
                </Chip>
                <Chip
                    selected={filter === "low"}
                    onPress={() => setFilter("low")}
                    mode={filter === "low" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    textStyle={{
                        color: filter === "low" ? "#FFFFFF" : theme.colors.text,
                    }}
                    style={[
                        styles.filterChip,
                        filter === "low" && styles.filterChipActive,
                    ]}
                >
                    Low Stock
                </Chip>
            </View>

            <View style={{ gap: 12, paddingBottom: 24 }}>
                {filteredItems.map((item) => {
                    const net = item.revenue - item.cogs;
                    return (
                        <Card key={item.id} style={styles.itemCard}>
                            <Card.Content style={{ gap: 12 }}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>
                                        {item.name}
                                    </Text>
                                    <Icon
                                        source="chevron-right"
                                        size={18}
                                        color={theme.colors.onSurface}
                                    />
                                </View>
                                <View style={styles.itemMetricsRow}>
                                    <Metric
                                        label="Sold"
                                        value={`${item.sold} units`}
                                    />
                                    <Metric
                                        label="REV"
                                        value={`${item.revenue.toLocaleString()}`}
                                    />
                                    <Metric
                                        label="COGS"
                                        value={`${item.cogs.toLocaleString()}`}
                                    />
                                </View>
                                <View style={styles.netRow}>
                                    <Text style={styles.netLabel}>
                                        {net >= 0 ? "Net Profit" : "Net Loss"}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.netValue,
                                            {
                                                color:
                                                    net >= 0
                                                        ? theme.colors.secondary
                                                        : theme.colors.error,
                                            },
                                        ]}
                                    >
                                        ETB {Math.abs(net).toLocaleString()}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                })}
            </View>
        </Screen>
    );
};

const Metric = ({ label, value }) => (
    <View style={{ gap: 4 }}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        gap: 14,
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
    rangeCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    rangeContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rangeLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    rangeIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryContainer,
        alignItems: "center",
        justifyContent: "center",
    },
    rangeLabel: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    rangeValue: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    summaryCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: 18,
        elevation: 0,
    },
    summaryTop: {
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
        fontSize: 22,
    },
    growthChip: {
        backgroundColor: "#1D4ED8",
    },
    growthText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    summaryMeta: {
        color: "#E0EAFF",
        fontSize: 12,
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
    itemCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    itemMetricsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    metricLabel: {
        color: theme.colors.onSurface,
        fontSize: 11,
    },
    metricValue: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    netRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    netLabel: {
        color: theme.colors.onSurface,
        fontSize: 12,
        fontWeight: "600",
    },
    netValue: {
        fontWeight: "700",
    },
});

export default ReportsScreen;
