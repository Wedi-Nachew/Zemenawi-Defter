import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    Icon,
    IconButton,
    Modal,
    Portal,
    Text,
    TextInput,
} from "react-native-paper";
import Screen from "../../src/components/Screen";
import theme from "../../src/theme";

const ReportsScreen = () => {
    const [range, setRange] = useState("month");
    const [filter, setFilter] = useState("all");
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [fromDate, setFromDate] = useState("Jan 01, 2026");
    const [toDate, setToDate] = useState("Feb 03, 2026");

    const rangeLabel = useMemo(() => {
        if (range === "today") return "Today";
        if (range === "week") return "This Week";
        if (range === "month") return "This Month";
        if (range === "custom") return `${fromDate} – ${toDate}`;
        return "This Month";
    }, [range, fromDate, toDate]);

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
        <Screen style={styles.container}>
            <Card
                style={styles.rangeCard}
                onPress={() => setCalendarOpen(true)}
            >
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
                            <Text style={styles.rangeValue}>{rangeLabel}</Text>
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            >
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
            </ScrollView>

            <Portal>
                <Modal
                    visible={calendarOpen}
                    onDismiss={() => setCalendarOpen(false)}
                    contentContainerStyle={styles.calendarSheet}
                >
                    <View style={styles.sheetHandle} />
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Select range</Text>
                        <IconButton
                            icon="close"
                            size={20}
                            onPress={() => setCalendarOpen(false)}
                        />
                    </View>

                    <View style={styles.rangeChips}>
                        <Chip
                            selected={range === "today"}
                            onPress={() => setRange("today")}
                            mode={range === "today" ? "flat" : "outlined"}
                            selectedColor="#FFFFFF"
                            textStyle={{
                                color:
                                    range === "today"
                                        ? "#FFFFFF"
                                        : theme.colors.text,
                            }}
                            style={[
                                styles.filterChip,
                                range === "today" && styles.filterChipActive,
                            ]}
                        >
                            Today
                        </Chip>
                        <Chip
                            selected={range === "week"}
                            onPress={() => setRange("week")}
                            mode={range === "week" ? "flat" : "outlined"}
                            selectedColor="#FFFFFF"
                            textStyle={{
                                color:
                                    range === "week"
                                        ? "#FFFFFF"
                                        : theme.colors.text,
                            }}
                            style={[
                                styles.filterChip,
                                range === "week" && styles.filterChipActive,
                            ]}
                        >
                            This Week
                        </Chip>
                        <Chip
                            selected={range === "month"}
                            onPress={() => setRange("month")}
                            mode={range === "month" ? "flat" : "outlined"}
                            selectedColor="#FFFFFF"
                            textStyle={{
                                color:
                                    range === "month"
                                        ? "#FFFFFF"
                                        : theme.colors.text,
                            }}
                            style={[
                                styles.filterChip,
                                range === "month" && styles.filterChipActive,
                            ]}
                        >
                            This Month
                        </Chip>
                        <Chip
                            selected={range === "custom"}
                            onPress={() => setRange("custom")}
                            mode={range === "custom" ? "flat" : "outlined"}
                            selectedColor="#FFFFFF"
                            textStyle={{
                                color:
                                    range === "custom"
                                        ? "#FFFFFF"
                                        : theme.colors.text,
                            }}
                            style={[
                                styles.filterChip,
                                range === "custom" && styles.filterChipActive,
                            ]}
                        >
                            Custom
                        </Chip>
                    </View>

                    <View style={styles.dateGrid}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>From</Text>
                            <TextInput
                                mode="outlined"
                                value={fromDate}
                                onChangeText={setFromDate}
                                outlineColor="#E5E7EB"
                                activeOutlineColor={theme.colors.primary}
                                style={styles.dateInput}
                                right={<TextInput.Icon icon="calendar" />}
                                onFocus={() => setRange("custom")}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>To</Text>
                            <TextInput
                                mode="outlined"
                                value={toDate}
                                onChangeText={setToDate}
                                outlineColor="#E5E7EB"
                                activeOutlineColor={theme.colors.primary}
                                style={styles.dateInput}
                                right={<TextInput.Icon icon="calendar" />}
                                onFocus={() => setRange("custom")}
                            />
                        </View>
                    </View>

                    <View style={styles.sheetActions}>
                        <Button
                            mode="outlined"
                            style={{ flex: 1 }}
                            onPress={() => setCalendarOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            style={{ flex: 1 }}
                            onPress={() => setCalendarOpen(false)}
                        >
                            Apply
                        </Button>
                    </View>
                </Modal>
            </Portal>
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
        paddingTop: 6,
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
    calendarSheet: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        marginTop: "auto",
        gap: 16,
    },
    sheetHandle: {
        width: 48,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#E5E7EB",
        alignSelf: "center",
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sheetTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    rangeChips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    dateGrid: {
        flexDirection: "row",
        gap: 12,
    },
    inputLabel: {
        color: theme.colors.onSurface,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        marginBottom: 6,
    },
    dateInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
    },
    sheetActions: {
        flexDirection: "row",
        gap: 12,
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
