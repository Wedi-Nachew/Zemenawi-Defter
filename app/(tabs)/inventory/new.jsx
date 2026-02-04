import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Icon,
    Text,
    TextInput,
} from "react-native-paper";
import FormScreen from "../../../src/components/FormScreen";
import { addStock } from "../../../src/services/inventoryService";
import { createProduct } from "../../../src/services/productService";
import theme from "../../../src/theme";

const unitOptions = [
    "kg",
    "g",
    "liter",
    "ml",
    "pcs",
    "box",
    "pack",
    "bag",
    "crate",
    "carton",
    "bundle",
    "other",
];

const AddProductScreen = () => {
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("kg");
    const [customUnit, setCustomUnit] = useState("");
    const [price, setPrice] = useState("");
    const [unitCost, setUnitCost] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [dateReceived, setDateReceived] = useState(
        new Date().toLocaleDateString(),
    );
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const quantityLabel = useMemo(() => `${quantity}`, [quantity]);

    const handleSave = async () => {
        const trimmedName = name.trim();
        const selectedUnit = unit === "other" ? customUnit.trim() : unit.trim();
        const priceValue = Number(String(price).replace(/,/g, ""));
        const costValue = Number(String(unitCost).replace(/,/g, ""));
        const qtyValue = Number(quantity);

        if (!trimmedName) {
            setSaveError("Product name is required.");
            return;
        }

        if (!selectedUnit) {
            setSaveError("Unit is required.");
            return;
        }

        if (!priceValue || priceValue <= 0) {
            setSaveError("Default selling price must be greater than zero.");
            return;
        }

        if (!costValue || costValue <= 0) {
            setSaveError("Unit cost must be greater than zero.");
            return;
        }

        if (!qtyValue || qtyValue <= 0) {
            setSaveError("Quantity must be greater than zero.");
            return;
        }

        setSaveError("");
        setSaving(true);

        try {
            const product = await createProduct({
                name: trimmedName,
                unit: selectedUnit,
                defaultSellingPrice: priceValue,
            });

            const parsedDate = Date.parse(dateReceived);
            const purchasedAt = Number.isNaN(parsedDate)
                ? Date.now()
                : parsedDate;

            await addStock(product, costValue, qtyValue, purchasedAt);

            router.back();
        } catch (error) {
            console.error("Failed to save product", error);
            setSaveError("Unable to save product. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: "Add New Product",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontWeight: "700",
                        fontSize: 20,
                    },
                }}
            />
            <FormScreen style={styles.container}>
                <View style={styles.fieldBlock}>
                    <Text style={styles.label}>Product Name</Text>
                    <TextInput
                        mode="outlined"
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Sugar, Soap, Pasta"
                        outlineColor="#E5E7EB"
                        activeOutlineColor={theme.colors.primary}
                        style={styles.input}
                    />
                </View>

                <View style={styles.fieldBlock}>
                    <Text style={styles.label}>Unit Type</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.unitRow}
                    >
                        {unitOptions.map((opt) => {
                            const selected = unit === opt;
                            return (
                                <Chip
                                    key={opt}
                                    mode={selected ? "flat" : "outlined"}
                                    selected={selected}
                                    onPress={() => setUnit(opt)}
                                    compact
                                    style={[
                                        styles.unitChip,
                                        selected && styles.unitChipSelected,
                                    ]}
                                    textStyle={{
                                        color: selected
                                            ? "#FFFFFF"
                                            : theme.colors.text,
                                        fontWeight: "600",
                                    }}
                                >
                                    {opt}
                                </Chip>
                            );
                        })}
                    </ScrollView>
                    {unit === "other" && (
                        <TextInput
                            mode="outlined"
                            value={customUnit}
                            onChangeText={setCustomUnit}
                            placeholder="Enter unit"
                            outlineColor="#E5E7EB"
                            activeOutlineColor={theme.colors.primary}
                            style={styles.input}
                        />
                    )}
                </View>

                <View style={styles.fieldBlock}>
                    <Text style={styles.label}>Default Selling Price</Text>
                    <TextInput
                        mode="outlined"
                        value={price}
                        onChangeText={setPrice}
                        placeholder="ETB 0.00"
                        keyboardType="numeric"
                        outlineColor="#E5E7EB"
                        activeOutlineColor={theme.colors.primary}
                        style={styles.input}
                        left={
                            <TextInput.Affix
                                text="ETB"
                                textStyle={styles.affix}
                            />
                        }
                    />
                </View>

                <Card style={styles.batchCard}>
                    <Card.Content style={{ gap: 16 }}>
                        <View style={styles.batchHeader}>
                            <View style={styles.batchIconWrap}>
                                <Icon
                                    source="cube-outline"
                                    color={theme.colors.primary}
                                    size={18}
                                />
                            </View>
                            <Text style={styles.batchTitle}>
                                First Batch Details
                            </Text>
                        </View>
                        <View style={styles.inlineRow}>
                            <View style={{ flex: 1, gap: 4 }}>
                                <Text style={styles.label}>Unit Cost</Text>
                                <TextInput
                                    mode="outlined"
                                    value={unitCost}
                                    onChangeText={setUnitCost}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    outlineColor="#E5E7EB"
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    left={
                                        <TextInput.Affix
                                            text="ETB"
                                            textStyle={styles.affix}
                                        />
                                    }
                                />
                            </View>
                            <View style={{ width: 12 }} />
                            <View style={{ flex: 1, gap: 4 }}>
                                <Text style={styles.label}>Quantity</Text>
                                <TextInput
                                    mode="outlined"
                                    value={quantityLabel}
                                    onChangeText={(text) => {
                                        const num = parseInt(text);
                                        if (!isNaN(num) && num > 0) {
                                            setQuantity(num);
                                        }
                                    }}
                                    keyboardType="numeric"
                                    outlineColor="#E5E7EB"
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                />
                                {/* <View style={styles.stepper}>
                                    <IconButton
                                        icon="minus"
                                        size={18}
                                        onPress={onDec}
                                        disabled={quantity <= 1}
                                    />

                                    <TextInput
                                        mode="outlined"
                                        value={quantityLabel}
                                        onChangeText={(text) => {
                                            const num = parseInt(text);
                                            if (!isNaN(num) && num > 0) {
                                                setQuantity(num);
                                            }
                                        }}
                                        keyboardType="numeric"
                                        outlineColor="#E5E7EB"
                                        activeOutlineColor={
                                            theme.colors.primary
                                        }
                                        style={[
                                            styles.input,
                                            {
                                                width: 80,
                                                height: 40,
                                                textAlign: "center",
                                                color: theme.colors.text,
                                            },
                                            styles.stepperValue,
                                        ]}
                                    />
                                    <IconButton
                                        icon="plus"
                                        size={18}
                                        onPress={onInc}
                                    />
                                </View> */}
                            </View>
                        </View>

                        <View>
                            <Text style={styles.label}>Date Received</Text>
                            <TextInput
                                mode="outlined"
                                value={dateReceived}
                                onChangeText={setDateReceived}
                                outlineColor="#E5E7EB"
                                activeOutlineColor={theme.colors.primary}
                                style={styles.input}
                                right={
                                    <TextInput.Icon
                                        icon="calendar"
                                        onPress={() => {}}
                                    />
                                }
                            />
                        </View>
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    icon="content-save"
                    contentStyle={styles.saveContent}
                    style={styles.saveButton}
                    onPress={handleSave}
                    loading={saving}
                    disabled={saving}
                >
                    Save Product
                </Button>
                {saving && (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator animating />
                        <Text style={styles.metaText}>Saving product…</Text>
                    </View>
                )}
                {!!saveError && !saving && (
                    <Text style={styles.errorText}>{saveError}</Text>
                )}
            </FormScreen>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 22,
        paddingBottom: 6,
        flex: 1,
    },

    fieldBlock: {
        gap: 8,
    },
    label: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    input: {
        borderRadius: 14,
        backgroundColor: theme.colors.surface,
    },
    affix: {
        color: theme.colors.onSurface,
        fontWeight: "600",
    },
    unitRow: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: "#E5E7EB",
        borderRadius: 16,
        padding: 6,
    },
    unitChip: {
        flex: 1,
        justifyContent: "center",
    },
    unitChipSelected: {
        backgroundColor: theme.colors.primary,
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
    inlineRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    stepper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        paddingHorizontal: 4,
        backgroundColor: "#F9FAFB",
    },
    stepperValue: {
        fontWeight: "700",
        color: theme.colors.text,
    },
    saveButton: {
        marginTop: "auto",
        borderRadius: 14,
    },
    saveContent: {
        paddingVertical: 6,
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
    },
    metaText: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        textAlign: "center",
    },
});

export default AddProductScreen;
