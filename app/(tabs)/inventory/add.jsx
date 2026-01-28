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

const unitOptions = ["kg", "box", "pcs", "other"];

const AddProductScreen = () => {
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("kg");
    const [price, setPrice] = useState("");
    const [unitCost, setUnitCost] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [dateReceived, setDateReceived] = useState("11/14/2023");

    const quantityLabel = useMemo(() => `${quantity}`, [quantity]);

    const onInc = () => setQuantity((q) => q + 1);
    const onDec = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

    return (
        <Screen contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="titleMedium" style={styles.headerTitle}>
                    Add New Product
                </Text>
                <View style={{ width: 40 }} />
            </View>

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
                <View style={styles.unitRow}>
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
                </View>
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
                        <TextInput.Affix text="ETB" textStyle={styles.affix} />
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
                        <View style={{ flex: 1 }}>
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
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Quantity</Text>
                            <View style={styles.stepper}>
                                <IconButton
                                    icon="minus"
                                    size={18}
                                    onPress={onDec}
                                    disabled={quantity <= 1}
                                />
                                <Text style={styles.stepperValue}>
                                    {quantityLabel}
                                </Text>
                                <IconButton
                                    icon="plus"
                                    size={18}
                                    onPress={onInc}
                                />
                            </View>
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
                            right={<TextInput.Icon icon="calendar" />}
                        />
                    </View>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                icon="content-save"
                contentStyle={styles.saveContent}
                style={styles.saveButton}
                onPress={() => {}}
            >
                Save Product
            </Button>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 18,
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
        borderRadius: 14,
    },
    saveContent: {
        paddingVertical: 6,
    },
});

export default AddProductScreen;
