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
    formatEthiopianDateTime,
    getEthiopianMonthDays,
    getEthiopianMonthName,
    getEthiopianWeekdayIndex,
    timestampToEthiopianParts,
} from "../utils/ethiopianCalendar";

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const EthiopianDateTimePicker = ({
    visible,
    value,
    onDismiss,
    onConfirm,
    title,
}) => {
    const { language } = useLanguage();
    const [year, setYear] = useState(2016);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);
    const [hour, setHour] = useState(1);
    const [minute, setMinute] = useState(0);
    const [period, setPeriod] = useState("day");

    useEffect(() => {
        if (!visible) return;
        const base = typeof value === "number" ? value : Date.now();
        const parts = timestampToEthiopianParts(base);
        setYear(parts.year);
        setMonth(parts.month);
        setDay(parts.day);
        setHour(parts.hour);
        setMinute(parts.minute);
        setPeriod(parts.period || "day");
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
    const monthLabel = monthLabels[month - 1] || getEthiopianMonthName(month);
    const firstWeekday = getEthiopianWeekdayIndex(year, month, 1);

    const previewTimestamp = ethiopianDateTimeToTimestamp({
        year,
        month,
        day,
        hour,
        minute,
        period,
    });

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

    const handleConfirm = () => {
        const timestamp = ethiopianDateTimeToTimestamp({
            year,
            month,
            day,
            hour,
            minute,
            period,
        });
        onConfirm?.(timestamp);
    };

    const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1);
    const minuteOptions = Array.from({ length: 12 }, (_, index) => index * 5);

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <Card style={styles.card}>
                    <Card.Content style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {title || i18n.t("sales.details.dateTime")}
                            </Text>
                            <IconButton icon="close" onPress={onDismiss} />
                        </View>

                        <Text style={styles.preview}>
                            {formatEthiopianDateTime(previewTimestamp, {
                                day: i18n.t("common.timePeriods.day"),
                                night: i18n.t("common.timePeriods.night"),
                            })}
                        </Text>

                        <View style={styles.monthRow}>
                            <IconButton
                                icon="chevron-left"
                                onPress={handlePrevMonth}
                            />
                            <View style={styles.monthCenter}>
                                <Text style={styles.monthLabel}>
                                    {monthLabel}
                                </Text>
                                <View style={styles.yearRow}>
                                    <IconButton
                                        icon="minus"
                                        size={18}
                                        onPress={() =>
                                            setYear((prev) => prev - 1)
                                        }
                                    />
                                    <Text style={styles.yearLabel}>{year}</Text>
                                    <IconButton
                                        icon="plus"
                                        size={18}
                                        onPress={() =>
                                            setYear((prev) => prev + 1)
                                        }
                                    />
                                </View>
                            </View>
                            <IconButton
                                icon="chevron-right"
                                onPress={handleNextMonth}
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
                                        style={[
                                            styles.dayCell,
                                            selected && styles.dayCellActive,
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
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.timeSection}>
                            <Text style={styles.timeLabel}>
                                {i18n.t("common.labels.time")}
                            </Text>
                            <View style={styles.periodRow}>
                                <Pressable
                                    onPress={() => setPeriod("day")}
                                    style={[
                                        styles.periodChip,
                                        period === "day" &&
                                            styles.periodChipActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.periodText,
                                            period === "day" &&
                                                styles.periodTextActive,
                                        ]}
                                    >
                                        {i18n.t("common.timePeriods.day")}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setPeriod("night")}
                                    style={[
                                        styles.periodChip,
                                        period === "night" &&
                                            styles.periodChipActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.periodText,
                                            period === "night" &&
                                                styles.periodTextActive,
                                        ]}
                                    >
                                        {i18n.t("common.timePeriods.night")}
                                    </Text>
                                </Pressable>
                            </View>
                            <View style={styles.timeGrid}>
                                <View style={styles.timeColumn}>
                                    <Text style={styles.timeColumnLabel}>
                                        {i18n.t("common.labels.hour")}
                                    </Text>
                                    <View style={styles.timeOptions}>
                                        {hourOptions.map((value) => (
                                            <Pressable
                                                key={value}
                                                onPress={() => setHour(value)}
                                                style={[
                                                    styles.timeOption,
                                                    value === hour &&
                                                        styles.timeOptionActive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.timeOptionText,
                                                        value === hour &&
                                                            styles.timeOptionTextActive,
                                                    ]}
                                                >
                                                    {value}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.timeColumn}>
                                    <Text style={styles.timeColumnLabel}>
                                        {i18n.t("common.labels.minute")}
                                    </Text>
                                    <View style={styles.timeOptions}>
                                        {minuteOptions.map((value) => (
                                            <Pressable
                                                key={value}
                                                onPress={() => setMinute(value)}
                                                style={[
                                                    styles.timeOption,
                                                    value === minute &&
                                                        styles.timeOptionActive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.timeOptionText,
                                                        value === minute &&
                                                            styles.timeOptionTextActive,
                                                    ]}
                                                >
                                                    {String(value).padStart(
                                                        2,
                                                        "0",
                                                    )}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <Button mode="outlined" onPress={onDismiss}>
                                {i18n.t("common.actions.cancel")}
                            </Button>
                            <Button mode="contained" onPress={handleConfirm}>
                                {i18n.t("common.actions.confirm")}
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
        gap: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontWeight: "700",
        color: theme.colors.text,
        fontSize: 16,
    },
    preview: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.primary,
    },
    monthRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    monthCenter: {
        alignItems: "center",
        gap: 4,
    },
    monthLabel: {
        fontWeight: "700",
        color: theme.colors.text,
    },
    yearRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    yearLabel: {
        fontWeight: "700",
        color: theme.colors.onSurface,
    },
    weekdayRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    weekdayLabel: {
        width: "14.28%",
        textAlign: "center",
        color: theme.colors.onSurface,
        fontSize: 11,
        fontWeight: "600",
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
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    dayCellActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    dayText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    dayTextActive: {
        color: "#FFFFFF",
    },
    timeSection: {
        gap: 10,
    },
    timeLabel: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    periodRow: {
        flexDirection: "row",
        gap: 8,
    },
    periodChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    periodChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    periodText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    periodTextActive: {
        color: "#FFFFFF",
    },
    timeGrid: {
        flexDirection: "row",
        gap: 16,
    },
    timeColumn: {
        flex: 1,
        gap: 8,
    },
    timeColumnLabel: {
        color: theme.colors.onSurface,
        fontSize: 12,
        fontWeight: "600",
    },
    timeOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    timeOption: {
        width: "22%",
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
    },
    timeOptionActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    timeOptionText: {
        color: theme.colors.text,
        fontWeight: "600",
        fontSize: 12,
    },
    timeOptionTextActive: {
        color: "#FFFFFF",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 8,
    },
});

export default EthiopianDateTimePicker;
