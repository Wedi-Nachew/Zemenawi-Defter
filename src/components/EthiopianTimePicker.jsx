import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Card, Modal, Portal, Text } from "react-native-paper";
import i18n from "../i18n";
import theme from "../theme";
import {
    ethiopianDateTimeToTimestamp,
    formatEthiopianTime,
    timestampToEthiopianParts,
} from "../utils/ethiopianCalendar";

const EthiopianTimePicker = ({ visible, value, onDismiss, onConfirm }) => {
    const [hour, setHour] = useState(1);
    const [minute, setMinute] = useState(0);
    const [period, setPeriod] = useState("day");

    useEffect(() => {
        if (!visible) return;
        const base = typeof value === "number" ? value : Date.now();
        const parts = timestampToEthiopianParts(base);
        setHour(parts.hour);
        setMinute(parts.minute);
        setPeriod(parts.period || "day");
    }, [visible, value]);

    const hourOptions = useMemo(
        () => Array.from({ length: 12 }, (_, index) => index + 1),
        [],
    );
    const minuteOptions = useMemo(
        () => Array.from({ length: 12 }, (_, index) => index * 5),
        [],
    );

    const previewTimestamp = ethiopianDateTimeToTimestamp({
        year: 2016,
        month: 1,
        day: 1,
        hour,
        minute,
        period,
    });

    const handleConfirm = () => {
        onConfirm?.({ hour, minute, period });
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <Card style={styles.card}>
                    <Card.Content style={styles.content}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>
                                {i18n.t("common.labels.time")}
                            </Text>
                        </View>

                        <View style={styles.periodRow}>
                            <Pressable
                                onPress={() => setPeriod("day")}
                                style={[
                                    styles.periodChip,
                                    period === "day" && styles.periodChipActive,
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

                        <View style={styles.timePreview}>
                            <Text style={styles.timePreviewText}>
                                {formatEthiopianTime(previewTimestamp, {
                                    day: i18n.t("common.timePeriods.day"),
                                    night: i18n.t("common.timePeriods.night"),
                                })}
                            </Text>
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
                                                {String(value).padStart(2, "0")}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <Button mode="outlined" onPress={onDismiss}>
                                {i18n.t("common.actions.cancel")}
                            </Button>
                            <Button mode="contained" onPress={handleConfirm}>
                                {i18n.t("common.actions.ok")}
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
    titleRow: {
        alignItems: "center",
    },
    title: {
        fontWeight: "700",
        color: theme.colors.text,
        fontSize: 16,
    },
    periodRow: {
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
    },
    periodChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        minWidth: 96,
        alignItems: "center",
    },
    periodChipActive: {
        backgroundColor: theme.colors.primaryContainer,
        borderColor: theme.colors.primary,
    },
    periodText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    periodTextActive: {
        color: theme.colors.primary,
    },
    timePreview: {
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        paddingVertical: 18,
        alignItems: "center",
    },
    timePreviewText: {
        fontSize: 28,
        fontWeight: "700",
        color: theme.colors.text,
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

export default EthiopianTimePicker;
