import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import database from "../../../src/database";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";
import { getProducts } from "../../../src/services/productService";
import theme from "../../../src/theme";

const ProductsScreen = () => {
    const { language } = useLanguage();
    const currencyPrefix = useMemo(
        () => i18n.t("common.currency.prefix"),
        [language],
    );
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");

    const loadProducts = useCallback(async () => {
        let active = true;
        setLoading(true);
        try {
            setError("");
            const result = await getProducts({
                search: query.trim(),
                filter,
            });
            if (!active) return;
            setProducts(result);
        } catch (error) {
            console.error("Failed to load products", error);
            if (active) setError(i18n.t("inventory.errors.load"));
        } finally {
            if (active) setLoading(false);
        }

        return () => {
            active = false;
        };
    }, [query, filter]);

    useEffect(() => {
        const cleanup = loadProducts();
        return () => {
            if (typeof cleanup === "function") cleanup();
        };
    }, [loadProducts]);

    useFocusEffect(
        useCallback(() => {
            const cleanup = loadProducts();
            return () => {
                if (typeof cleanup === "function") cleanup();
            };
        }, [loadProducts]),
    );

    useEffect(() => {
        const productsCollection = database.collections.get("products");
        const subscriptions = [productsCollection.query().observe()].map(
            (observable) => observable.subscribe(() => loadProducts()),
        );

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [loadProducts]);

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
                            {currencyPrefix}{" "}
                            {item.defaultSellingPrice.toLocaleString()} /{" "}
                            {item.unit}
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
                    headerTitle: i18n.t("inventory.title"),
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
                    placeholder={i18n.t("inventory.searchPlaceholder")}
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
                        {i18n.t("inventory.filters.all")}
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
                        {i18n.t("inventory.filters.lowStock")}
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
                        {i18n.t("inventory.filters.outOfStock")}
                    </Chip>
                </View>

                <Divider style={styles.divider} />

                {!!error && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 12 }} />
                    )}
                    contentContainerStyle={{ paddingBottom: 72 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        loading ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyTitle}>
                                    {i18n.t("inventory.loading.title")}
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    {i18n.t("inventory.loading.subtitle")}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyTitle}>
                                    {i18n.t("inventory.empty.title")}
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    {i18n.t("inventory.empty.subtitle")}
                                </Text>
                            </View>
                        )
                    }
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
    emptyState: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    emptyTitle: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 14,
    },
    emptySubtitle: {
        color: theme.colors.onSurface,
        marginTop: 4,
        fontSize: 12,
    },
    errorBanner: {
        backgroundColor: "#FEE2E2",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#FCA5A5",
        marginBottom: 8,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
    },
});

export default ProductsScreen;
