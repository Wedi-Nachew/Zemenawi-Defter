import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
    Card,
    Chip,
    Divider,
    Icon,
    IconButton,
    Searchbar,
    Text,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import theme from "../../../src/theme";

const ProductsScreen = () => {
    const products = useMemo(
        () => [
            {
                id: "p1",
                name: "Harar Coffee",
                unit: "kg",
                price: 650,
                stock: 18,
            },
            {
                id: "p2",
                name: "Flour (25kg)",
                unit: "bag",
                price: 1550,
                stock: 1,
            },
            {
                id: "p3",
                name: "Mineral Water",
                unit: "crate",
                price: 300,
                stock: 5,
            },
            {
                id: "p4",
                name: "Sunflower Oil",
                unit: "liter",
                price: 180,
                stock: 0,
            },
            {
                id: "p5",
                name: "Sugar (50kg)",
                unit: "bag",
                price: 2800,
                stock: 12,
            },
            {
                id: "p6",
                name: "Salt (25kg)",
                unit: "bag",
                price: 900,
                stock: 0,
            },
            {
                id: "p7",
                name: "Eggs (30pcs)",
                unit: "carton",
                price: 220,
                stock: 8,
            },
            {
                id: "p8",
                name: "Butter",
                unit: "kg",
                price: 450,
                stock: 3,
            },
            {
                id: "p9",
                name: "Cheese",
                unit: "kg",
                price: 550,
                stock: 0,
            },
        ],
        [],
    );

    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = products.filter((p) =>
            q ? p.name.toLowerCase().includes(q) : true,
        );
        if (filter === "low")
            list = list.filter((p) => p.stock > 0 && p.stock <= 5);
        if (filter === "out") list = list.filter((p) => p.stock === 0);
        return list;
    }, [products, query, filter]);

    const renderItem = ({ item }) => {
        const status = getStockStatus(item.stock);
        return (
            <Card
                style={styles.card}
                onPress={() =>
                    router.push({
                        pathname: "/(tabs)/inventory/details",
                        params: { id: item.id },
                    })
                }
            >
                <Card.Content style={styles.cardRow}>
                    <View
                        style={[
                            styles.iconWrap,
                            { backgroundColor: status.bg },
                        ]}
                    >
                        <Icon
                            source="cube-outline"
                            color={status.icon}
                            size={22}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={styles.name}>
                            {item.name}
                        </Text>
                        <Text style={styles.meta}>
                            ETB {item.price.toLocaleString()} / {item.unit}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.stockBadge,
                            { backgroundColor: status.badgeBg },
                        ]}
                    >
                        <View
                            style={[
                                styles.dot,
                                { backgroundColor: status.dot },
                            ]}
                        />
                        <Text
                            style={[
                                styles.stockBadgeText,
                                { color: status.badgeText },
                            ]}
                        >
                            {item.stock}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: "Products",
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
                            onPress={() => router.push("/(tabs)/inventory/new")}
                        />
                    ),
                }}
            />
            <Screen style={styles.container}>
                <Searchbar
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search inventory..."
                    style={styles.search}
                    inputStyle={{ fontSize: 16 }}
                    iconColor={theme.colors.primary}
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
                        selected={filter === "low"}
                        onPress={() => setFilter("low")}
                        mode={filter === "low" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "low"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "low" && styles.filterChipActive,
                        ]}
                    >
                        Low Stock
                    </Chip>
                    <Chip
                        selected={filter === "out"}
                        onPress={() => setFilter("out")}
                        mode={filter === "out" ? "flat" : "outlined"}
                        selectedColor="#FFFFFF"
                        textStyle={{
                            color:
                                filter === "out"
                                    ? "#FFFFFF"
                                    : theme.colors.text,
                        }}
                        style={[
                            styles.filterChip,
                            filter === "out" && styles.filterChipActive,
                        ]}
                    >
                        Out of Stock
                    </Chip>
                </View>

                <Divider style={styles.divider} />

                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 12 }} />
                    )}
                    contentContainerStyle={{ paddingBottom: 72 }}
                    showsVerticalScrollIndicator={false}
                />
            </Screen>
        </>
    );
};

const getStockStatus = (stock) => {
    if (stock === 0)
        return {
            bg: "#FEE2E2",
            dot: theme.colors.error,
            badgeBg: "#FDE8E8",
            badgeText: theme.colors.error,
            icon: theme.colors.error,
        };
    if (stock <= 5)
        return {
            bg: "#FEF3C7",
            dot: theme.colors.warning,
            badgeBg: "#FEF3C7",
            badgeText: theme.colors.warning,
            icon: theme.colors.warning,
        };
    return {
        bg: "#E7F5ED",
        dot: theme.colors.secondary,
        badgeBg: "#E7F5ED",
        badgeText: theme.colors.secondary,
        icon: theme.colors.secondary,
    };
};

const styles = StyleSheet.create({
    container: {
        gap: 14,
        paddingBottom: 24,
        paddingTop: 2,
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
    subtitle: {
        color: theme.colors.onSurface,
        marginTop: 4,
    },
    search: {
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginTop: 2,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 6,
        // marginBottom: 2,
        paddingBottom: 4,
    },
    divider: {
        // marginVertical: 4,
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
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    name: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    meta: {
        color: theme.colors.onSurface,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    stockBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    stockBadgeText: {
        fontWeight: "700",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 8,
    },
});

export default ProductsScreen;
