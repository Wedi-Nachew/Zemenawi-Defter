import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    Icon,
    IconButton,
    Text,
    TextInput,
} from "react-native-paper";
import Screen from "../../../src/components/Screen";
import theme from "../../../src/theme";

const NewSaleScreen = () => {
    const [query, setQuery] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paidAmount, setPaidAmount] = useState("3100");

    const cartItems = useMemo(
        () => [
            { id: "c1", name: "Teff Flour (10kg)", price: 1200, qty: 1 },
            { id: "c2", name: "Cooking Oil (5L)", price: 950, qty: 2 },
        ],
        [],
    );

    const totals = useMemo(() => {
        const total = cartItems.reduce(
            (sum, item) => sum + item.price * item.qty,
            0,
        );
        const items = cartItems.reduce((sum, item) => sum + item.qty, 0);
        return { total, items };
    }, [cartItems]);

    return (
        <Screen contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="titleMedium" style={styles.headerTitle}>
                    New Sale
                </Text>
                <IconButton
                    icon="trash-can-outline"
                    iconColor={theme.colors.error}
                    onPress={() => {}}
                />
            </View>

            <SearchBar value={query} onChangeText={setQuery} />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Cart Items</Text>
                <Text style={styles.sectionMeta}>
                    {cartItems.length} Products
                </Text>
            </View>

            <Card style={styles.card}>
                <Card.Content style={{ gap: 12 }}>
                    {cartItems.map((item) => (
                        <View key={item.id} style={styles.cartRow}>
                            <View style={styles.itemIconWrap}>
                                <Icon
                                    source="cube-outline"
                                    size={18}
                                    color={theme.colors.primary}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemMeta}>
                                    {item.price.toLocaleString()} ETB
                                </Text>
                            </View>
                            <View style={styles.qtyWrap}>
                                <IconButton
                                    icon="minus"
                                    size={16}
                                    onPress={() => {}}
                                />
                                <Text style={styles.qtyValue}>{item.qty}</Text>
                                <IconButton
                                    icon="plus"
                                    size={16}
                                    onPress={() => {}}
                                />
                            </View>
                            <IconButton
                                icon="trash-can-outline"
                                size={18}
                                onPress={() => {}}
                            />
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Customer</Text>
            </View>
            <Card style={styles.card}>
                <Card.Content style={{ gap: 12 }}>
                    <View style={styles.customerRow}>
                        <View>
                            <Text style={styles.itemName}>Abebe Bikila</Text>
                        </View>
                        <Icon
                            source="chevron-down"
                            size={20}
                            color={theme.colors.onSurface}
                        />
                    </View>
                    <View style={styles.alertPill}>
                        <Icon
                            source="alert"
                            size={16}
                            color={theme.colors.warning}
                        />
                        <Text style={styles.alertText}>
                            Outstanding Balance: 4,250 ETB
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Payment Method</Text>
            </View>
            <Card style={styles.card}>
                <Card.Content style={{ gap: 12 }}>
                    <View style={styles.paymentRow}>
                        <Chip
                            icon="cash"
                            selected={paymentMethod === "cash"}
                            onPress={() => setPaymentMethod("cash")}
                            mode={
                                paymentMethod === "cash" ? "flat" : "outlined"
                            }
                            selectedColor="#FFFFFF"
                            style={[
                                styles.methodChip,
                                paymentMethod === "cash" &&
                                    styles.methodChipActive,
                            ]}
                            textStyle={{
                                color:
                                    paymentMethod === "cash"
                                        ? "#FFFFFF"
                                        : theme.colors.text,
                            }}
                        >
                            Cash
                        </Chip>
                        <Chip
                            icon="credit-card"
                            selected={paymentMethod === "credit"}
                            onPress={() => setPaymentMethod("credit")}
                            mode={
                                paymentMethod === "credit" ? "flat" : "outlined"
                            }
                            selectedColor="#FFFFFF"
                            style={[
                                styles.methodChip,
                                paymentMethod === "credit" &&
                                    styles.methodChipActive,
                            ]}
                            textStyle={{
                                color:
                                    paymentMethod === "credit"
                                        ? "#FFFFFF"
                                        : theme.colors.text,
                            }}
                        >
                            Credit
                        </Chip>
                    </View>

                    <View>
                        <Text style={styles.sectionLabel}>
                            Paid Amount (ETB)
                        </Text>
                        <TextInput
                            mode="outlined"
                            value={paidAmount}
                            onChangeText={setPaidAmount}
                            keyboardType="numeric"
                            outlineColor="#E5E7EB"
                            activeOutlineColor={theme.colors.primary}
                            style={styles.input}
                            right={<TextInput.Affix text="ETB" />}
                        />
                        <Text style={styles.helperText}>
                            Subtotal: 3,100.00 ETB
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryRow}>
                    <View>
                        <Text style={styles.sectionLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>
                            {totals.total.toLocaleString()} ETB
                        </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.sectionLabel}>Items Count</Text>
                        <Text style={styles.itemsValue}>
                            {totals.items} Units
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                icon="check"
                style={styles.submitButton}
                onPress={() => {}}
            >
                Complete Sale
            </Button>
        </Screen>
    );
};

const SearchBar = ({ value, onChangeText }) => (
    <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        placeholder="Search products to add..."
        outlineColor="#E5E7EB"
        activeOutlineColor={theme.colors.primary}
        style={styles.search}
        left={<TextInput.Icon icon="magnify" />}
    />
);

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
    headerTitle: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    search: {
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    sectionLabel: {
        color: theme.colors.onSurface,
        fontWeight: "600",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    sectionMeta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    cartRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    itemIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryContainer,
        alignItems: "center",
        justifyContent: "center",
    },
    itemName: {
        color: theme.colors.text,
        fontWeight: "700",
    },
    itemMeta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    qtyWrap: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        paddingHorizontal: 4,
        backgroundColor: "#F9FAFB",
    },
    qtyValue: {
        fontWeight: "700",
        color: theme.colors.text,
        minWidth: 16,
        textAlign: "center",
    },
    customerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    alertPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "#FEF3C7",
    },
    alertText: {
        color: theme.colors.warning,
        fontWeight: "600",
        fontSize: 12,
    },
    paymentRow: {
        flexDirection: "row",
        gap: 12,
    },
    methodChip: {
        flex: 1,
        borderRadius: 14,
    },
    methodChipActive: {
        backgroundColor: theme.colors.primary,
    },
    input: {
        backgroundColor: theme.colors.surface,
    },
    helperText: {
        color: theme.colors.onSurface,
        fontSize: 12,
        marginTop: 6,
    },
    summaryCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 0,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalValue: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 20,
        marginTop: 4,
    },
    itemsValue: {
        color: theme.colors.primary,
        fontWeight: "700",
        marginTop: 4,
    },
    submitButton: {
        borderRadius: 16,
    },
});

export default NewSaleScreen;
