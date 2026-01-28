import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    Divider,
    Icon,
    IconButton,
    Modal,
    Portal,
    Text,
    TextInput,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import theme from "../../../src/theme";

const catalog = {
    p1: {
        id: "p1",
        name: "Harar Coffee",
        unit: "kg",
        price: 650,
        stock: 18,
        batches: [
            {
                id: "b1",
                date: "Jan 18, 2026",
                purchasePrice: 420,
                remaining: 5,
            },
            {
                id: "b2",
                date: "Jan 05, 2026",
                purchasePrice: 400,
                remaining: 13,
            },
        ],
    },
    p2: {
        id: "p2",
        name: "Flour (25kg)",
        unit: "bag",
        price: 1550,
        stock: 1,
        batches: [
            {
                id: "b3",
                date: "Jan 12, 2026",
                purchasePrice: 1200,
                remaining: 1,
            },
        ],
    },
    p3: {
        id: "p3",
        name: "Mineral Water",
        unit: "crate",
        price: 300,
        stock: 5,
        batches: [
            {
                id: "b4",
                date: "Jan 10, 2026",
                purchasePrice: 180,
                remaining: 5,
            },
        ],
    },
    p4: {
        id: "p4",
        name: "Sunflower Oil",
        unit: "liter",
        price: 180,
        stock: 0,
        batches: [
            {
                id: "b5",
                date: "Dec 29, 2025",
                purchasePrice: 130,
                remaining: 0,
            },
        ],
    },
};

const ProductDetails = () => {
    const { id } = useLocalSearchParams();
    const [sheet, setSheet] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [qty, setQty] = useState("1");
    const [cost, setCost] = useState("");
    const [dateReceived, setDateReceived] = useState("Jan 28, 2026");
    const [productName, setProductName] = useState("");
    const [productUnit, setProductUnit] = useState("");
    const [productPrice, setProductPrice] = useState("");

    const product = useMemo(
        () => (typeof id === "string" ? catalog[id] : undefined),
        [id],
    );

    if (!product) {
        return (
            <Screen contentContainerStyle={styles.container}>
                <View style={styles.headerRow}>
                    <IconButton
                        icon="arrow-left"
                        onPress={() => router.back()}
                    />
                    <Text variant="titleMedium" style={styles.title}>
                        Product Details
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <Card style={styles.card}>
                    <Card.Content style={{ gap: 8 }}>
                        <Text style={styles.title}>Product not found</Text>
                        <Text style={styles.meta}>
                            Select a product from the list to view its details.
                        </Text>
                        <Button mode="contained" onPress={() => router.back()}>
                            Back to list
                        </Button>
                    </Card.Content>
                </Card>
            </Screen>
        );
    }

    const status = getStockStatus(product.stock);

    const openAddStock = () => {
        setSelectedBatch(null);
        setQty("1");
        setCost("");
        setDateReceived("Jan 28, 2026");
        setSheet("add-stock");
    };

    const openEditBatch = (batch) => {
        setSelectedBatch(batch);
        setQty(String(batch.remaining));
        setCost(String(batch.purchasePrice));
        setDateReceived(batch.date);
        setSheet("edit-stock");
    };

    const openEditProduct = () => {
        setProductName(product.name);
        setProductUnit(product.unit);
        setProductPrice(String(product.price));
        setSheet("edit-product");
    };

    return (
        <Screen contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="titleMedium" style={styles.title}>
                    {product.name}
                </Text>
                <IconButton
                    icon="dots-horizontal"
                    onPress={() => {}}
                    accessibilityLabel="More"
                />
            </View>

            <Card style={styles.heroCard}>
                <Card.Content style={{ gap: 12 }}>
                    <View style={styles.heroRow}>
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
                            <Text variant="headlineSmall" style={styles.title}>
                                {product.name}
                            </Text>
                            <Text style={styles.meta}>
                                Unit: {product.unit}
                            </Text>
                        </View>
                        <Chip
                            compact
                            style={[
                                styles.statusChip,
                                { backgroundColor: status.badgeBg },
                            ]}
                            textStyle={{
                                color: status.badgeText,
                                fontWeight: "700",
                            }}
                        >
                            {status.label}
                        </Chip>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Selling Price</Text>
                        <Text style={styles.priceValue}>
                            ETB {product.price.toLocaleString()}
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.infoCard}>
                <Card.Content style={styles.infoGrid}>
                    <InfoCell
                        label="Current Stock"
                        value={`${product.stock} ${product.unit}`}
                        tone={status.badgeBg}
                    />
                    <InfoCell
                        label="Unit Price"
                        value={`ETB ${product.price.toLocaleString()}`}
                    />
                    <InfoCell label="SKU" value={product.id.toUpperCase()} />
                </Card.Content>
            </Card>

            <Card style={styles.batchCard}>
                <Card.Content style={{ gap: 12 }}>
                    <View style={styles.batchHeader}>
                        <View style={styles.batchIconWrap}>
                            <Icon
                                source="layers-outline"
                                color={theme.colors.primary}
                                size={18}
                            />
                        </View>
                        <Text style={styles.batchTitle}>Batch History</Text>
                    </View>
                    {product.batches.map((batch, idx) => (
                        <View key={batch.id} style={{ paddingVertical: 6 }}>
                            <View style={styles.batchRow}>
                                <View>
                                    <Text style={styles.title}>
                                        {batch.date}
                                    </Text>
                                    <Text style={styles.meta}>
                                        {batch.remaining} left
                                    </Text>
                                </View>
                                <Button
                                    mode="outlined"
                                    compact
                                    icon="pencil"
                                    onPress={() => openEditBatch(batch)}
                                >
                                    Edit Stock
                                </Button>
                            </View>
                            <Text style={styles.meta}>
                                Purchase ETB{" "}
                                {batch.purchasePrice.toLocaleString()}
                            </Text>
                            {idx < product.batches.length - 1 && (
                                <Divider style={{ marginTop: 10 }} />
                            )}
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <View style={styles.actionsRow}>
                <Button
                    mode="outlined"
                    icon="pencil"
                    style={{ flex: 1 }}
                    onPress={openEditProduct}
                >
                    Edit Product
                </Button>
                <Button
                    mode="contained"
                    icon="plus"
                    style={{ flex: 1 }}
                    onPress={openAddStock}
                >
                    Add Stock
                </Button>
            </View>
            <Button mode="contained-tonal" icon="cart" onPress={() => {}}>
                Record Sale
            </Button>

            <Portal>
                <Modal
                    visible={!!sheet}
                    onDismiss={() => setSheet(null)}
                    contentContainerStyle={styles.sheet}
                >
                    <View style={styles.sheetHandle} />
                    <View style={styles.sheetHeader}>
                        <Text variant="titleMedium" style={styles.sheetTitle}>
                            {sheet === "edit-product"
                                ? "Edit Product"
                                : sheet === "edit-stock"
                                  ? "Edit Batch Stock"
                                  : "Add Stock"}
                        </Text>
                        <IconButton
                            icon="close"
                            onPress={() => setSheet(null)}
                        />
                    </View>

                    {sheet === "edit-product" ? (
                        <View style={{ gap: 8 }}>
                            <View>
                                <Text style={styles.sheetLabel}>
                                    Product Name
                                </Text>
                                <TextInput
                                    mode="outlined"
                                    value={productName}
                                    onChangeText={setProductName}
                                    outlineColor="#E5E7EB"
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.sheetInput}
                                />
                            </View>
                            <View style={styles.sheetGrid}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.sheetLabel}>Unit</Text>
                                    <TextInput
                                        mode="outlined"
                                        value={productUnit}
                                        onChangeText={setProductUnit}
                                        outlineColor="#E5E7EB"
                                        activeOutlineColor={
                                            theme.colors.primary
                                        }
                                        style={styles.sheetInput}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.sheetLabel}>
                                        Unit Price
                                    </Text>
                                    <TextInput
                                        mode="outlined"
                                        value={productPrice}
                                        onChangeText={setProductPrice}
                                        keyboardType="numeric"
                                        outlineColor="#E5E7EB"
                                        activeOutlineColor={
                                            theme.colors.primary
                                        }
                                        style={styles.sheetInput}
                                        left={<TextInput.Affix text="ETB" />}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.sheetGrid}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.sheetLabel}>
                                        Quantity
                                    </Text>
                                    <TextInput
                                        mode="outlined"
                                        value={qty}
                                        onChangeText={setQty}
                                        keyboardType="numeric"
                                        outlineColor="#E5E7EB"
                                        activeOutlineColor={
                                            theme.colors.primary
                                        }
                                        style={styles.sheetInput}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.sheetLabel}>
                                        Unit Cost
                                    </Text>
                                    <TextInput
                                        mode="outlined"
                                        value={cost}
                                        onChangeText={setCost}
                                        keyboardType="numeric"
                                        outlineColor="#E5E7EB"
                                        activeOutlineColor={
                                            theme.colors.primary
                                        }
                                        style={styles.sheetInput}
                                        left={<TextInput.Affix text="ETB" />}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text style={styles.sheetLabel}>
                                    Date Received
                                </Text>
                                <TextInput
                                    mode="outlined"
                                    value={dateReceived}
                                    onChangeText={setDateReceived}
                                    outlineColor="#E5E7EB"
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.sheetInput}
                                    right={<TextInput.Icon icon="calendar" />}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.sheetActions}>
                        <Button
                            mode="outlined"
                            style={{ flex: 1 }}
                            onPress={() => setSheet(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            style={{ flex: 1 }}
                            onPress={() => setSheet(null)}
                        >
                            Save
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </Screen>
    );
};

const InfoCell = ({ label, value, tone }) => (
    <View style={[styles.infoCell, tone && { backgroundColor: tone }]}>
        <Text style={styles.meta}>{label}</Text>
        <Text style={styles.title}>{value}</Text>
    </View>
);

const getStockStatus = (stock) => {
    if (stock === 0)
        return {
            label: "Out of stock",
            bg: "#FEE2E2",
            dot: theme.colors.error,
            badgeBg: "#FDE8E8",
            badgeText: theme.colors.error,
            icon: theme.colors.error,
        };
    if (stock <= 5)
        return {
            label: "Low stock",
            bg: "#FEF3C7",
            dot: theme.colors.warning,
            badgeBg: "#FEF3C7",
            badgeText: theme.colors.warning,
            icon: theme.colors.warning,
        };
    return {
        label: "In stock",
        bg: "#E7F5ED",
        dot: theme.colors.secondary,
        badgeBg: "#E7F5ED",
        badgeText: theme.colors.secondary,
        icon: theme.colors.secondary,
    };
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingBottom: 32,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    meta: {
        color: theme.colors.onSurface,
    },
    heroCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
    },
    heroRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    statusChip: {
        borderRadius: 12,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceLabel: {
        color: theme.colors.onSurface,
    },
    priceValue: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 20,
    },
    infoCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
    },
    infoGrid: {
        flexDirection: "row",
        gap: 12,
        flexWrap: "wrap",
    },
    infoCell: {
        minWidth: "48%",
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        gap: 6,
    },
    batchCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
    },
    batchHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    batchIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryContainer,
        alignItems: "center",
        justifyContent: "center",
    },
    batchTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    batchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
    },
    sheet: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        marginTop: "auto",
    },
    sheetHandle: {
        width: 48,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#E5E7EB",
        alignSelf: "center",
        marginBottom: 12,
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    sheetTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    sheetLabel: {
        color: theme.colors.onSurface,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        marginBottom: 6,
    },
    sheetInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        marginBottom: 12,
    },
    sheetGrid: {
        flexDirection: "row",
        gap: 12,
    },
    sheetActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
});

export default ProductDetails;
