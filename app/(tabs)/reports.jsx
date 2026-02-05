import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
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
import { getSalesReportByDateRange } from "../../src/services/reportingService";
import theme from "../../src/theme";

const ReportsScreen = () => {
    const [range, setRange] = useState("month");
    const [filter, setFilter] = useState("all");
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [fromDate, setFromDate] = useState("Jan 01, 2026");
    const [toDate, setToDate] = useState("Feb 03, 2026");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [report, setReport] = useState({
        profit: 0,
        revenue: 0,
        cogs: 0,
        items: [],
    });

    const rangeLabel = useMemo(() => {
        if (range === "today") return "Today";
        if (range === "week") return "This Week";
        if (range === "month") return "This Month";
        if (range === "custom") return `${fromDate} – ${toDate}`;
        return "This Month";
    }, [range, fromDate, toDate]);

    const getRangeDates = () => {
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        if (range === "today") {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        }
        if (range === "week") {
            const start = new Date(now);
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        }
        if (range === "custom") {
            const parsedStart = Date.parse(fromDate);
            const parsedEnd = Date.parse(toDate);
            if (
                !Number.isNaN(parsedStart) &&
                !Number.isNaN(parsedEnd) &&
                parsedStart <= parsedEnd
            ) {
                const start = new Date(parsedStart);
                const customEnd = new Date(parsedEnd);
                customEnd.setHours(23, 59, 59, 999);
                start.setHours(0, 0, 0, 0);
                return { start, end: customEnd };
            }
        }

        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    };

    const customRangeInvalid = useMemo(() => {
        if (range !== "custom") return false;
        const parsedStart = Date.parse(fromDate);
        const parsedEnd = Date.parse(toDate);
        return (
            Number.isNaN(parsedStart) ||
            Number.isNaN(parsedEnd) ||
            parsedStart > parsedEnd
        );
    }, [range, fromDate, toDate]);

    const loadReport = useCallback(async () => {
        setLoading(true);
        try {
            setError("");
            const { start, end } = getRangeDates();
            const result = await getSalesReportByDateRange(
                start.getTime(),
                end.getTime(),
            );
            setReport(result);
        } catch (error) {
            console.error("Failed to load report", error);
            setReport({ profit: 0, revenue: 0, cogs: 0, items: [] });
            setError("Unable to load reports.");
        } finally {
            setLoading(false);
        }
    }, [range, fromDate, toDate]);

    useEffect(() => {
        let active = true;
        if (!active) return;
        loadReport();
        return () => {
            active = false;
        };
    }, [loadReport]);

    useFocusEffect(
        useCallback(() => {
            loadReport();
        }, [loadReport]),
    );

    const filteredItems = useMemo(() => {
        return report.items.filter((item) => {
            if (filter === "high") return item.revenue - item.cogs > 5000;
            if (filter === "low") return item.stock <= 5;
            return true;
        });
    }, [report.items, filter]);

    return (
        <Screen style={styles.container}>
            {!!error && (
                <Card style={styles.errorCard}>
                    <Card.Content>
                        <Text style={styles.errorText}>{error}</Text>
                    </Card.Content>
                </Card>
            )}
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
                                ETB {report.profit.toLocaleString()}
                            </Text>
                        </View>
                        <Chip
                            compact
                            style={styles.growthChip}
                            textStyle={styles.growthText}
                        >
                            {report.profit >= 0 ? "+" : ""}
                            {report.revenue > 0
                                ? Math.round(
                                      ((report.profit || 0) / report.revenue) *
                                          100,
                                  )
                                : 0}
                            %
                        </Chip>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryMeta}>
                            REV: ETB {report.revenue.toLocaleString()}
                        </Text>
                        <Text style={styles.summaryMeta}>
                            COGS: ETB {report.cogs.toLocaleString()}
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
                    All
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            >
                {loading && (
                    <Card style={styles.itemCard}>
                        <Card.Content style={{ gap: 10 }}>
                            <ActivityIndicator />
                            <Text style={styles.metricLabel}>
                                Loading report...
                            </Text>
                        </Card.Content>
                    </Card>
                )}
                {!loading && filteredItems.length === 0 && (
                    <Card style={styles.itemCard}>
                        <Card.Content>
                            <Text style={styles.metricLabel}>
                                No sales in this period.
                            </Text>
                        </Card.Content>
                    </Card>
                )}
                {!loading &&
                    filteredItems.map((item) => {
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
                                            {net >= 0
                                                ? "Net Profit"
                                                : "Net Loss"}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.netValue,
                                                {
                                                    color:
                                                        net >= 0
                                                            ? theme.colors
                                                                  .secondary
                                                            : theme.colors
                                                                  .error,
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
                            onPress={() => {
                                if (customRangeInvalid) return;
                                setCalendarOpen(false);
                            }}
                            disabled={customRangeInvalid}
                        >
                            Apply
                        </Button>
                    </View>
                    {customRangeInvalid && (
                        <Text style={styles.errorText}>
                            Enter a valid custom date range.
                        </Text>
                    )}
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
    errorCard: {
        backgroundColor: "#FEE2E2",
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: "#FCA5A5",
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
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 8,
    },
});

export default ReportsScreen;
