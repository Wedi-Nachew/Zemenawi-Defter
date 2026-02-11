import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    IconButton,
    Modal,
    Portal,
    Text,
} from "react-native-paper";
import i18n from "../i18n";
import { useLanguage } from "../i18n/LanguageContext";
import theme from "../theme";
import {
    ethiopianDateTimeToTimestamp,
    getEthiopianMonthDays,
    getEthiopianMonthName,
    getEthiopianWeekdayIndex,
    timestampToEthiopianParts,
} from "../utils/ethiopianCalendar";

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const EthiopianDatePicker = ({ visible, value, onDismiss, onConfirm }) => {
    const { language } = useLanguage();
    const [year, setYear] = useState(2016);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);

    useEffect(() => {
        if (!visible) return;
        const base = typeof value === "number" ? value : Date.now();
        const parts = timestampToEthiopianParts(base);
        setYear(parts.year);
        setMonth(parts.month);
        setDay(parts.day);
    }, [visible, value]);

    const daysInMonth = useMemo(
        () => getEthiopianMonthDays(year, month),
        [year, month],
    );

    useEffect(() => {
        setDay((current) => clamp(current, 1, daysInMonth));
    }, [daysInMonth]);

    const weekdayLabels = useMemo(
        () => i18n.t("common.weekdays.short") || [],
        [language],
    );
    const monthLabels = useMemo(
        () => i18n.t("common.months.ethiopian") || [],
        [language],
    );
    const firstWeekday = getEthiopianWeekdayIndex(year, month, 1);
    const monthLabel = monthLabels[month - 1] || getEthiopianMonthName(month);

    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(13);
            setYear((prev) => prev - 1);
            return;
        }
        setMonth((prev) => prev - 1);
    };

    const handleNextMonth = () => {
        if (month === 13) {
            setMonth(1);
            setYear((prev) => prev + 1);
            return;
        }
        setMonth((prev) => prev + 1);
    };

    const handleToday = () => {
        const now = Date.now();
        const parts = timestampToEthiopianParts(now);
        setYear(parts.year);
        setMonth(parts.month);
        setDay(parts.day);
        onConfirm?.({
            year: parts.year,
            month: parts.month,
            day: parts.day,
            timestamp: ethiopianDateTimeToTimestamp({
                year: parts.year,
                month: parts.month,
                day: parts.day,
            }),
        });
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <Card style={styles.card}>
                    <Card.Content style={styles.content}>
                        <View style={styles.header}>
                            <IconButton
                                icon="chevron-left"
                                onPress={handlePrevMonth}
                                size={22}
                            />
                            <View style={styles.monthCenter}>
                                <Text style={styles.monthLabel}>
                                    {monthLabel}
                                </Text>
                                <View style={styles.yearRow}>
                                    <Text style={styles.yearLabel}>{year}</Text>
                                    <IconButton
                                        icon="chevron-down"
                                        size={16}
                                        onPress={() =>
                                            setYear((prev) => prev - 1)
                                        }
                                    />
                                </View>
                            </View>
                            <IconButton
                                icon="chevron-right"
                                onPress={handleNextMonth}
                                size={22}
                            />
                        </View>

                        <View style={styles.weekdayRow}>
                            {weekdayLabels.map((label, index) => (
                                <Text key={index} style={styles.weekdayLabel}>
                                    {label}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.dayGrid}>
                            {Array.from(
                                { length: firstWeekday },
                                (_, index) => (
                                    <View
                                        key={`empty-${index}`}
                                        style={styles.dayCellPlaceholder}
                                    />
                                ),
                            )}
                            {Array.from({ length: daysInMonth }, (_, index) => {
                                const value = index + 1;
                                const selected = value === day;
                                return (
                                    <Pressable
                                        key={value}
                                        onPress={() => setDay(value)}
                                        style={styles.dayCell}
                                    >
                                        <View
                                            style={[
                                                styles.dayCellInner,
                                                selected &&
                                                    styles.dayCellInnerActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.dayText,
                                                    selected &&
                                                        styles.dayTextActive,
                                                ]}
                                            >
                                                {value}
                                            </Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.actions}>
                            <Button mode="outlined" onPress={onDismiss}>
                                {i18n.t("common.actions.cancel")}
                            </Button>
                            <Button mode="contained" onPress={handleToday}>
                                {i18n.t("common.actions.today")}
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
    },
    content: {
        gap: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    monthCenter: {
        alignItems: "center",
        gap: 0,
    },
    monthLabel: {
        fontWeight: "700",
        color: theme.colors.text,
        fontSize: 15,
    },
    yearRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    yearLabel: {
        fontWeight: "600",
        color: theme.colors.onSurface,
        fontSize: 11,
    },
    weekdayRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 6,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    weekdayLabel: {
        width: "14.28%",
        textAlign: "center",
        color: theme.colors.primary,
        fontSize: 10,
        fontWeight: "700",
    },
    dayGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 6,
        justifyContent: "flex-start",
        alignContent: "flex-start",
    },
    dayCellPlaceholder: {
        width: "14.28%",
        aspectRatio: 1,
        padding: 2,
    },
    dayCell: {
        width: "14.28%",
        aspectRatio: 1,
        padding: 2,
    },
    dayCellInner: {
        width: "100%",
        height: "100%",
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3F4F6",
    },
    dayCellInnerActive: {
        backgroundColor: theme.colors.primary,
    },
    dayText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    dayTextActive: {
        color: "#FFFFFF",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
});

export default EthiopianDatePicker;
