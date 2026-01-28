import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    Card,
    Chip,
    Icon,
    IconButton,
    Searchbar,
    Text,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import theme from "../../../src/theme";

const SalesScreen = () => {
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");

    const sections = useMemo(
        () => [
            {
                title: "Today, Oct 24",
                items: [
                    {
                        id: "s1",
                        customer: "Abebe Kebede",
                        amount: 4500,
                        profit: 900,
                        tag: "Credit",
                        status: "credit",
                        time: "10:30 AM",
                        receipt: "#ZM-9042",
                    },
                    {
                        id: "s2",
                        customer: "Walking Customer",
                        amount: 1200,
                        profit: 300,
                        tag: "Paid",
                        status: "paid",
                        time: "09:15 AM",
                        receipt: "#ZM-9041",
                    },
                ],
            },
            {
                title: "Yesterday, Oct 23",
                items: [
                    {
                        id: "s3",
                        customer: "Selamawit G.",
                        amount: 8900,
                        profit: -500,
                        tag: "Partial",
                        status: "partial",
                        time: "04:15 PM",
                        receipt: "#ZM-9038",
                    },
                    {
                        id: "s4",
                        customer: "Kaleb Tadesse",
                        amount: 550,
                        profit: 120,
                        tag: "Paid",
                        status: "paid",
                        time: "11:20 AM",
                        receipt: "#ZM-9035",
                    },
                ],
            },
        ],
        [],
    );

    const filteredSections = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sections
            .map((section) => {
                const items = section.items.filter((item) => {
                    const matchesQuery = q
                        ? item.customer.toLowerCase().includes(q) ||
                          item.receipt.toLowerCase().includes(q)
                        : true;
                    const matchesFilter =
                        filter === "all" ||
                        (filter === "cash" && item.status === "paid") ||
                        (filter === "credit" && item.status === "credit") ||
                        (filter === "partial" && item.status === "partial");
                    return matchesQuery && matchesFilter;
                });
                return { ...section, items };
            })
            .filter((section) => section.items.length > 0);
    }, [filter, query, sections]);

    return (
        <Screen contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <Text variant="titleLarge" style={styles.title}>
                    Sales History
                </Text>
                <IconButton
                    icon="plus"
                    mode="contained"
                    containerColor={theme.colors.primary}
                    iconColor="#FFFFFF"
                    size={20}
                    onPress={() => router.push("/(tabs)/sales/new")}
                />
            </View>

            <Searchbar
                value={query}
                onChangeText={setQuery}
                placeholder="Search receipt ID or customer..."
                style={styles.search}
                inputStyle={{ fontSize: 15 }}
                iconColor={theme.colors.onSurface}
            />

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
                    selected={filter === "cash"}
                    onPress={() => setFilter("cash")}
                    mode={filter === "cash" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    textStyle={{
                        color:
                            filter === "cash" ? "#FFFFFF" : theme.colors.text,
                    }}
                    style={[
                        styles.filterChip,
                        filter === "cash" && styles.filterChipActive,
                    ]}
                >
                    Cash
                </Chip>
                <Chip
                    selected={filter === "credit"}
                    onPress={() => setFilter("credit")}
                    mode={filter === "credit" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    textStyle={{
                        color:
                            filter === "credit" ? "#FFFFFF" : theme.colors.text,
                    }}
                    style={[
                        styles.filterChip,
                        filter === "credit" && styles.filterChipActive,
                    ]}
                >
                    Credit
                </Chip>
                <Chip
                    selected={filter === "partial"}
                    onPress={() => setFilter("partial")}
                    mode={filter === "partial" ? "flat" : "outlined"}
                    selectedColor="#FFFFFF"
                    textStyle={{
                        color:
                            filter === "partial"
                                ? "#FFFFFF"
                                : theme.colors.text,
                    }}
                    style={[
                        styles.filterChip,
                        filter === "partial" && styles.filterChipActive,
                    ]}
                >
                    Partial
                </Chip>
            </View>

            {filteredSections.map((section) => (
                <View key={section.title} style={{ gap: 12 }}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {section.items.map((item) => {
                        const status = getStatusTone(item.status);
                        return (
                            <Card
                                key={item.id}
                                style={styles.card}
                                onPress={() =>
                                    router.push({
                                        pathname: "/(tabs)/sales/details",
                                        params: { id: item.id },
                                    })
                                }
                            >
                                <Card.Content style={styles.cardRow}>
                                    <View
                                        style={[
                                            styles.avatar,
                                            { backgroundColor: status.iconBg },
                                        ]}
                                    >
                                        <Icon
                                            source={status.icon}
                                            color={status.iconColor}
                                            size={18}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardTitle}>
                                            {item.customer}
                                        </Text>
                                        <Text style={styles.meta}>
                                            {item.receipt} • {item.time}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            alignItems: "flex-end",
                                            gap: 6,
                                        }}
                                    >
                                        <Text style={styles.amount}>
                                            {item.amount.toLocaleString()} ETB
                                        </Text>
                                        <Text
                                            style={
                                                item.profit >= 0
                                                    ? styles.profit
                                                    : styles.loss
                                            }
                                        >
                                            {item.profit >= 0
                                                ? `Profit ETB ${item.profit.toLocaleString()}`
                                                : `Loss ETB ${Math.abs(item.profit).toLocaleString()}`}
                                        </Text>
                                        <View
                                            style={[
                                                styles.statusPill,
                                                {
                                                    backgroundColor:
                                                        status.pillBg,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: status.pillText },
                                                ]}
                                            >
                                                {item.tag}
                                            </Text>
                                        </View>
                                    </View>
                                    <Icon
                                        source="chevron-right"
                                        color={theme.colors.onSurface}
                                        size={20}
                                    />
                                </Card.Content>
                            </Card>
                        );
                    })}
                </View>
            ))}
        </Screen>
    );
};
// },
const getStatusTone = (status) => {
    if (status === "credit") {
        return {
            icon: "file-document-outline",
            iconBg: "#DBEAFE",
            iconColor: theme.colors.primary,
            pillBg: "#E0EAFF",
            pillText: theme.colors.primary,
        };
    }
    if (status === "partial") {
        return {
            icon: "account-alert-outline",
            iconBg: "#FEF3C7",
            iconColor: theme.colors.warning,
            pillBg: "#FEF3C7",
            pillText: theme.colors.warning,
        };
    }
    return {
        icon: "account-check-outline",
        iconBg: "#DCFCE7",
        iconColor: theme.colors.secondary,
        pillBg: "#DCFCE7",
        pillText: theme.colors.secondary,
    };
};

const styles = StyleSheet.create({
    container: {
        gap: 14,
        paddingBottom: 32,
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
    search: {
        borderRadius: theme.roundness,
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
    sectionTitle: {
        color: theme.colors.onSurface,
        fontWeight: "600",
        marginTop: 8,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    meta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    amount: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    profit: {
        color: theme.colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    loss: {
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: "600",
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
    },
});

export default SalesScreen;
