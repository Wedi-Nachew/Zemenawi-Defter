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
import database from "../../src/database";
import i18n from "../../src/i18n";
import { useLanguage } from "../../src/i18n/LanguageContext";
import { getSalesReportByDateRange } from "../../src/services/reportingService";
import theme from "../../src/theme";

const ReportsScreen = () => {
    const { language } = useLanguage();
    const locale = language === "ti" ? "ti-ET" : "en";
    const formatDate = (date) => date.toLocaleDateString(locale);
    const formatDateInput = (date) => date.toISOString().slice(0, 10);
    const parseInputDate = (value) => {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? null : new Date(parsed);
    };

    const [range, setRange] = useState("month");
    const [filter, setFilter] = useState("all");
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [fromDate, setFromDate] = useState(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return formatDateInput(start);
    });
    const [toDate, setToDate] = useState(() => formatDateInput(new Date()));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [report, setReport] = useState({
        profit: 0,
        revenue: 0,
        cogs: 0,
        items: [],
    });

    const rangeLabel = useMemo(() => {
        if (range === "today") return i18n.t("reports.range.today");
        if (range === "week") return i18n.t("reports.range.week");
        if (range === "month") return i18n.t("reports.range.month");
        if (range === "custom") {
            const parsedStart = parseInputDate(fromDate);
            const parsedEnd = parseInputDate(toDate);
            if (parsedStart && parsedEnd) {
                return `${formatDate(parsedStart)} – ${formatDate(parsedEnd)}`;
            }
            return i18n.t("reports.range.custom");
        }
        return i18n.t("reports.range.month");
    }, [range, fromDate, toDate, language]);

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
            const parsedStart = parseInputDate(fromDate);
            const parsedEnd = parseInputDate(toDate);
            if (parsedStart && parsedEnd && parsedStart <= parsedEnd) {
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
        const parsedStart = parseInputDate(fromDate);
        const parsedEnd = parseInputDate(toDate);
        return !parsedStart || !parsedEnd || parsedStart > parsedEnd;
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
            setError(i18n.t("reports.errors.load"));
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

    useEffect(() => {
        const salesCollection = database.collections.get("sales");
        const saleItemsCollection = database.collections.get("sale_items");
        const subscriptions = [
            salesCollection.query().observe(),
            saleItemsCollection.query().observe(),
        ].map((observable) => observable.subscribe(() => loadReport()));

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [loadReport]);

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
                            <Text style={styles.rangeLabel}>
                                {i18n.t("reports.timePeriod")}
                            </Text>
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
                                {i18n.t("reports.summary.totalNetProfit")}
                            </Text>
                            <Text style={styles.summaryValue}>
                                {i18n.t("common.currency.prefix")}{" "}
                                {report.profit.toLocaleString()}
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
                            {i18n.t("reports.summary.revenueShort")}:{" "}
                            {i18n.t("common.currency.prefix")}{" "}
                            {report.revenue.toLocaleString()}
                        </Text>
                        <Text style={styles.summaryMeta}>
                            {i18n.t("reports.summary.cogsShort")}:{" "}
                            {i18n.t("common.currency.prefix")}{" "}
                            {report.cogs.toLocaleString()}
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
                    {i18n.t("reports.filters.all")}
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
                    {i18n.t("reports.filters.highMargin")}
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
                    {i18n.t("reports.filters.lowStock")}
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
                                {i18n.t("reports.loading")}
                            </Text>
                        </Card.Content>
                    </Card>
                )}
                {!loading && filteredItems.length === 0 && (
                    <Card style={styles.itemCard}>
                        <Card.Content>
                            <Text style={styles.metricLabel}>
                                {i18n.t("reports.empty")}
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
                                            label={i18n.t(
                                                "reports.metrics.sold",
                                            )}
                                            value={`${item.sold} ${i18n.t("reports.metrics.units")}`}
                                        />
                                        <Metric
                                            label={i18n.t(
                                                "reports.summary.revenueShort",
                                            )}
                                            value={`${item.revenue.toLocaleString()}`}
                                        />
                                        <Metric
                                            label={i18n.t(
                                                "reports.summary.cogsShort",
                                            )}
                                            value={`${item.cogs.toLocaleString()}`}
                                        />
                                    </View>
                                    <View style={styles.netRow}>
                                        <Text style={styles.netLabel}>
                                            {net >= 0
                                                ? i18n.t(
                                                      "reports.metrics.netProfit",
                                                  )
                                                : i18n.t(
                                                      "reports.metrics.netLoss",
                                                  )}
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
                                            {i18n.t("common.currency.prefix")}{" "}
                                            {Math.abs(net).toLocaleString()}
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
                        <Text style={styles.sheetTitle}>
                            {i18n.t("reports.selectRange")}
                        </Text>
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
                            {i18n.t("reports.range.today")}
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
                            {i18n.t("reports.range.week")}
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
                            {i18n.t("reports.range.month")}
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
                            {i18n.t("reports.range.custom")}
                        </Chip>
                    </View>

                    <View style={styles.dateGrid}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>
                                {i18n.t("reports.from")}
                            </Text>
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
                            <Text style={styles.inputLabel}>
                                {i18n.t("reports.to")}
                            </Text>
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
                            {i18n.t("common.actions.cancel")}
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
                            {i18n.t("common.actions.apply")}
                        </Button>
                    </View>
                    {customRangeInvalid && (
                        <Text style={styles.errorText}>
                            {i18n.t("reports.errors.invalidRange")}
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
