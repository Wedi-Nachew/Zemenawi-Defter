import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Dialog,
    Divider,
    Icon,
    IconButton,
    Modal,
    Portal,
    Text,
    TextInput,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import {
    deleteProduct,
    getProductBatches,
    getProductById,
} from "../../../src/services/productService";
import theme from "../../../src/theme";

const ProductDetails = () => {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [sheet, setSheet] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [qty, setQty] = useState("1");
    const [cost, setCost] = useState("");
    const [dateReceived, setDateReceived] = useState("Jan 28, 2026");
    const [productName, setProductName] = useState("");
    const [productUnit, setProductUnit] = useState("");
    const [productPrice, setProductPrice] = useState("");

    useEffect(() => {
        let active = true;

        const loadProductDetails = async () => {
            if (typeof id !== "string") return;
            setLoading(true);
            try {
                const result = await getProductById(id);
                const batchRows = await getProductBatches(id);
                if (!active) return;
                setProduct(result);
                setBatches(batchRows);
            } catch (error) {
                console.error("Failed to load product details", error);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProductDetails();

        return () => {
            active = false;
        };
    }, [id]);

    const displayBatches = useMemo(
        () =>
            batches.map((batch) => ({
                id: batch.id,
                remaining: batch.remainingQuantity ?? 0,
                purchasePrice: batch.purchasePrice ?? 0,
                date: batch.purchasedAt
                    ? new Date(batch.purchasedAt).toLocaleDateString()
                    : "",
            })),
        [batches],
    );

    if (!product) {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerTitle: "Product Details",
                        headerTitleStyle: {
                            fontWeight: "700",
                            fontSize: 20,
                        },
                        headerTitleAlign: "center",
                    }}
                />
                <Screen style={styles.container}>
                    <Card style={styles.card}>
                        <Card.Content style={{ gap: 8, alignItems: "center" }}>
                            <Text style={styles.title}>
                                {loading
                                    ? "Loading product…"
                                    : "Product not found"}
                            </Text>
                            <Text style={styles.meta}>
                                {loading
                                    ? "Fetching product details."
                                    : "Select a product from the list to view its details."}
                            </Text>
                            {loading && (
                                <ActivityIndicator
                                    style={{ marginTop: 8 }}
                                    animating
                                />
                            )}
                            {!loading && (
                                <Button
                                    mode="contained"
                                    onPress={() => router.back()}
                                >
                                    Back to list
                                </Button>
                            )}
                        </Card.Content>
                    </Card>
                </Screen>
            </>
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

    const openDeleteProductConfirmation = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteProduct = async () => {
        if (!product) return;
        setDeleting(true);
        if (product.stock > 0) return;
        try {
            await deleteProduct(product);
            setDeleteDialogOpen(false);
            router.back();
        } catch (error) {
            console.error("Failed to delete product", error);
        } finally {
            setDeleting(false);
        }
    };

    const openEditProduct = () => {
        setProductName(product.name);
        setProductUnit(product.unit);
        setProductPrice(String(product.defaultSellingPrice));
        setSheet("edit-product");
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: product.name,
                    headerTitleStyle: {
                        fontWeight: "700",
                        fontSize: 20,
                    },
                    headerTitleAlign: "center",
                }}
            />
            <Screen>
                <ScrollView
                    style={{ flex: 1, gap: 16 }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.container}
                >
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
                                    <Text
                                        variant="headlineSmall"
                                        style={styles.title}
                                    >
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
                                <Text style={styles.priceLabel}>
                                    Selling Price
                                </Text>
                                <Text style={styles.priceValue}>
                                    ETB{" "}
                                    {product.defaultSellingPrice.toLocaleString()}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <View style={styles.actionsRow}>
                        <Button
                            mode="contained"
                            icon="plus"
                            style={{ flex: 1 }}
                            onPress={openAddStock}
                        >
                            Add Stock
                        </Button>
                        <Button
                            mode="outlined"
                            icon="pencil"
                            style={{ flex: 1 }}
                            onPress={openEditProduct}
                        >
                            Edit Product
                        </Button>
                    </View>

                    <Card style={styles.infoCard}>
                        <Card.Content style={styles.infoGrid}>
                            <InfoCell
                                label="Current Stock"
                                value={`${product.stock} ${product.unit}`}
                                tone={status.badgeBg}
                            />
                            <InfoCell
                                label="Unit Price"
                                value={`ETB ${product.defaultSellingPrice.toLocaleString()}`}
                            />
                            <InfoCell
                                label="SKU"
                                value={product.id.toUpperCase()}
                            />
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
                                <Text style={styles.batchTitle}>
                                    Batch History
                                </Text>
                            </View>
                            {loading ? (
                                <View style={styles.emptyBatch}>
                                    <ActivityIndicator animating />
                                    <Text style={styles.meta}>
                                        Loading batch history…
                                    </Text>
                                </View>
                            ) : displayBatches.length === 0 ? (
                                <View style={styles.emptyBatch}>
                                    <Text style={styles.meta}>
                                        No batches recorded.
                                    </Text>
                                </View>
                            ) : (
                                displayBatches.map((batch, idx) => (
                                    <View
                                        key={batch.id}
                                        style={{ paddingVertical: 6 }}
                                    >
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
                                                onPress={() =>
                                                    openEditBatch(batch)
                                                }
                                            >
                                                Edit Stock
                                            </Button>
                                        </View>
                                        <Text style={styles.meta}>
                                            Purchase ETB{" "}
                                            {batch.purchasePrice.toLocaleString()}
                                        </Text>
                                        {idx < displayBatches.length - 1 && (
                                            <Divider
                                                style={{ marginTop: 10 }}
                                            />
                                        )}
                                    </View>
                                ))
                            )}
                        </Card.Content>
                    </Card>
                </ScrollView>

                <View style={styles.deleteButtonContainer}>
                    <Button
                        mode="text"
                        icon="trash-can"
                        style={styles.deleteButton}
                        labelStyle={{
                            color: theme.colors.error,
                            fontWeight: "bold",
                        }}
                        onPress={openDeleteProductConfirmation}
                    >
                        Delete Product
                    </Button>
                </View>
                <Portal>
                    <Dialog
                        visible={deleteDialogOpen}
                        onDismiss={() => setDeleteDialogOpen(false)}
                        style={styles.dialog}
                    >
                        <Dialog.Title style={styles.dialogTitle}>
                            Delete product?
                        </Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.meta}>
                                This action can’t be undone. The product will be
                                removed if there is no remaining stock.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                mode="text"
                                onPress={() => setDeleteDialogOpen(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                buttonColor={theme.colors.error}
                                onPress={handleDeleteProduct}
                                loading={deleting}
                                disabled={deleting}
                            >
                                Delete
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        visible={deleting && product.stock > 0}
                        onDismiss={() => setDeleting(false)}
                        style={styles.dialog}
                    >
                        <Dialog.Title style={styles.dialogTitle}>
                            Cannot delete product
                        </Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.meta}>
                                You cannot delete a product that has remaining
                                stock. Please reduce the stock to zero before
                                deleting.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                mode="contained"
                                onPress={() => {
                                    setDeleting(false);
                                    setDeleteDialogOpen(false);
                                }}
                            >
                                OK
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Modal
                        visible={!!sheet}
                        onDismiss={() => setSheet(null)}
                        contentContainerStyle={styles.sheet}
                    >
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text
                                variant="titleMedium"
                                style={styles.sheetTitle}
                            >
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
                                        activeOutlineColor={
                                            theme.colors.primary
                                        }
                                        style={styles.sheetInput}
                                    />
                                </View>
                                <View style={styles.sheetGrid}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sheetLabel}>
                                            Unit
                                        </Text>
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
                                            left={
                                                <TextInput.Affix text="ETB" />
                                            }
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
                                            left={
                                                <TextInput.Affix text="ETB" />
                                            }
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
                                        activeOutlineColor={
                                            theme.colors.primary
                                        }
                                        style={styles.sheetInput}
                                        right={
                                            <TextInput.Icon icon="calendar" />
                                        }
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
        </>
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
        backgroundColor: theme.colors.background,
        paddingTop: 6,
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
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
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
    emptyBatch: {
        paddingVertical: 8,
        alignItems: "center",
        gap: 8,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
    },

    deleteButtonContainer: {
        marginTop: 12,
    },

    deleteButton: {
        backgroundColor: "transparent",
        color: theme.colors.error,
        fontWeight: "700",
    },
    dialog: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
    },
    dialogTitle: {
        color: theme.colors.text,
        fontWeight: "700",
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
