import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    IconButton,
    Searchbar,
    Text,
} from "react-native-paper";
import InitialAvatar from "../../../src/components/InitialAvatar";
import Screen from "../../../src/components/Screen";
import theme from "../../../src/theme";

const CustomerCreditsScreen = () => {
    const customers = useMemo(
        () => [
            {
                id: "c1",
                name: "Abebe Kebede",
                phone: "+251 911 234 567",
                balance: 12500,
            },
            {
                id: "c2",
                name: "Sara Tesfaye",
                phone: "+251 912 345 678",
                balance: 8200,
            },
            {
                id: "c3",
                name: "Restaurant Tana",
                phone: "+251 911 889 900",
                balance: 1500,
            },
            {
                id: "c4",
                name: "Dawit Meles",
                phone: "+251 900 112 233",
                balance: 0,
            },
        ],
        [],
    );

    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");

    const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);

    const filteredCustomers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return customers.filter((c) => {
            const matchesQuery = q
                ? c.name.toLowerCase().includes(q) || c.phone.includes(q)
                : true;
            const matchesFilter =
                filter === "all" ||
                (filter === "balance" && c.balance > 0) ||
                (filter === "paid" && c.balance === 0);
            return matchesQuery && matchesFilter;
        });
    }, [customers, filter, query]);

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: "Credits",
                    headerTitleStyle: {
                        fontSize: 22,
                        fontWeight: "700",
                    },
                    headerRight: () => (
                        <IconButton
                            icon="plus"
                            mode="contained"
                            containerColor={theme.colors.primary}
                            iconColor="#FFFFFF"
                            size={22}
                            onPress={() => router.push("/(tabs)/sales/new")}
                        />
                    ),
                }}
            />
            <Screen style={styles.container}>
                <Card style={styles.summaryCard}>
                    <Card.Content style={styles.summaryContent}>
                        <View style={{ gap: 6 }}>
                            <Text style={styles.summaryLabel}>
                                Total Outstanding Credit
                            </Text>
                            <Text
                                variant="headlineMedium"
                                style={styles.summaryValue}
                            >
                                ETB {totalOutstanding.toLocaleString()}
                            </Text>
                        </View>
                        <Button mode="contained" compact onPress={() => {}}>
                            View History
                        </Button>
                    </Card.Content>
                </Card>

                <Searchbar
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search customers..."
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
                            color:
                                filter === "all"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "all" && styles.filterChipActive,
                        ]}
                    >
                        All
                    </Chip>
                    <Chip
                        selected={filter === "balance"}
                        onPress={() => setFilter("balance")}
                        mode={filter === "balance" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "balance"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "balance" && styles.filterChipActive,
                        ]}
                    >
                        Has Balance
                    </Chip>
                    <Chip
                        selected={filter === "paid"}
                        onPress={() => setFilter("paid")}
                        mode={filter === "paid" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "paid"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "paid" && styles.filterChipActive,
                        ]}
                    >
                        Paid Off
                    </Chip>
                </View>

                <FlatList
                    data={filteredCustomers}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ gap: 12, paddingBottom: 28 }}
                    renderItem={({ item }) => (
                        <Card
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: "/(tabs)/credits/details",
                                    params: { id: item.id },
                                })
                            }
                        >
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.customerRow}>
                                    <InitialAvatar name={item.name} />
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            variant="titleMedium"
                                            style={styles.cardTitle}
                                        >
                                            {item.name}
                                        </Text>
                                        <Text style={styles.subtitle}>
                                            {item.phone}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            alignItems: "flex-end",
                                            gap: 6,
                                        }}
                                    >
                                        <Text style={styles.balanceValue}>
                                            ETB {item.balance.toLocaleString()}
                                        </Text>
                                        <Chip
                                            compact
                                            mode="outlined"
                                            style={
                                                item.balance > 0
                                                    ? styles.balanceChip
                                                    : styles.paidChip
                                            }
                                            textStyle={{
                                                color:
                                                    item.balance > 0
                                                        ? theme.colors.error
                                                        : theme.colors
                                                              .secondary,
                                            }}
                                        >
                                            {item.balance > 0
                                                ? "Has Balance"
                                                : "Paid"}
                                        </Chip>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                />
            </Screen>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 14,
        paddingTop: 6,
        paddingBottom: 24,
    },

    title: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    subtitle: {
        color: theme.colors.onSurface,
    },
    summaryCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: 18,
        elevation: 0,
    },
    summaryContent: {
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
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    cardContent: {
        gap: 10,
    },
    customerRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    cardTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    balanceValue: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    balanceChip: {
        borderColor: "#FEE2E2",
        backgroundColor: "#FEE2E2",
    },
    paidChip: {
        borderColor: "#DCFCE7",
        backgroundColor: "#DCFCE7",
    },
});

export default CustomerCreditsScreen;
