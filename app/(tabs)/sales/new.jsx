import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Icon,
    IconButton,
    Modal,
    Portal,
    Text,
    TextInput,
    TouchableRipple,
} from "react-native-paper";
import EthiopianDatePicker from "../../../src/components/EthiopianDatePicker";
import EthiopianTimePicker from "../../../src/components/EthiopianTimePicker";
import FormScreen from "../../../src/components/FormScreen";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";
import { getCustomersWithBalances } from "../../../src/services/creditService";
import { createCustomer } from "../../../src/services/customerService";
import { getProducts } from "../../../src/services/productService";
import { createSale } from "../../../src/services/saleService";
import theme from "../../../src/theme";
import {
    ethiopianDateTimeToTimestamp,
    formatEthiopianDate,
    formatEthiopianTime,
    timestampToEthiopianParts,
} from "../../../src/utils/ethiopianCalendar";

const NewSaleScreen = () => {
    const { language } = useLanguage();
    const currencyPrefix = useMemo(
        () => i18n.t("common.currency.prefix"),
        [language],
    );
    const [query, setQuery] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paidAmount, setPaidAmount] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [customerModalVisible, setCustomerModalVisible] = useState(false);
    const [customerQuery, setCustomerQuery] = useState("");
    const [addCustomerVisible, setAddCustomerVisible] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [addProductVisible, setAddProductVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addQty, setAddQty] = useState("1");
    const [addPrice, setAddPrice] = useState("");
    const [editItem, setEditItem] = useState(null);
    const [editQty, setEditQty] = useState("1");
    const [editPrice, setEditPrice] = useState("");
    const [saleTimestamp, setSaleTimestamp] = useState(() => Date.now());
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [timePickerOpen, setTimePickerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [productRows, customerRows] = await Promise.all([
                getProducts(),
                getCustomersWithBalances(),
            ]);

            setProducts(productRows);
            setCustomers(
                customerRows.map(({ customer, balance }) => ({
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone || "",
                    balance,
                    model: customer,
                })),
            );
        } catch (error) {
            console.error("Failed to load sales data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData]),
    );

    const filteredProducts = useMemo(() => {
        if (!query.trim()) {
            return [];
        }
        const normalized = query.trim().toLowerCase();
        return products.filter((product) =>
            product.name.toLowerCase().includes(normalized),
        );
    }, [products, query]);

    const filteredCustomers = useMemo(() => {
        const normalized = customerQuery.trim().toLowerCase();
        return customers.filter((customer) => {
            if (!normalized) {
                return true;
            }
            return (
                customer.name.toLowerCase().includes(normalized) ||
                customer.phone.includes(normalized)
            );
        });
    }, [customerQuery, customers]);

    const totals = useMemo(() => {
        const total = cartItems.reduce(
            (sum, item) => sum + Number(item.price) * Number(item.qty),
            0,
        );
        const items = cartItems.reduce((sum, item) => sum + item.qty, 0);
        return { total, items };
    }, [cartItems]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setAddQty("1");
        setAddPrice(String(product.defaultSellingPrice ?? 0));
    };

    const handleAddToCart = () => {
        if (!selectedProduct) {
            return;
        }
        const qty = Math.max(1, Number(addQty) || 1);
        const price = Math.max(0, Number(addPrice) || 0);
        setCartItems((prev) => {
            const existing = prev.find(
                (row) => row.productId === selectedProduct.id,
            );
            if (existing) {
                return prev.map((row) =>
                    row.productId === selectedProduct.id
                        ? { ...row, qty: row.qty + qty, price }
                        : row,
                );
            }
            return [
                ...prev,
                {
                    id: `${selectedProduct.id}-${Date.now()}`,
                    productId: selectedProduct.id,
                    product: selectedProduct,
                    name: selectedProduct.name,
                    price,
                    qty,
                },
            ];
        });
        setSelectedProduct(null);
        setAddQty("1");
        setAddPrice("");
    };

    const handleEditItem = (item) => {
        setEditItem(item);
        setEditQty(String(item.qty));
        setEditPrice(String(item.price));
    };

    const handleSaveEdit = () => {
        if (!editItem) {
            return;
        }
        const qty = Math.max(1, Number(editQty) || 1);
        const price = Math.max(0, Number(editPrice) || 0);
        setCartItems((prev) =>
            prev.map((row) =>
                row.id === editItem.id ? { ...row, qty, price } : row,
            ),
        );
        setEditItem(null);
        setEditQty("1");
        setEditPrice("");
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCustomerModalVisible(false);
    };

    const handleAddCustomer = async () => {
        if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
            return;
        }
        try {
            const created = await createCustomer({
                name: newCustomerName,
                phone: newCustomerPhone,
            });
            const newCustomer = {
                id: created.id,
                name: created.name,
                phone: created.phone || "",
                balance: 0,
                model: created,
            };
            setCustomers((prev) => [newCustomer, ...prev]);
            setSelectedCustomer(newCustomer);
            setNewCustomerName("");
            setNewCustomerPhone("");
            setAddCustomerVisible(false);
            setCustomerModalVisible(false);
        } catch (error) {
            console.error("Failed to add customer", error);
        }
    };

    const handleSubmitSale = async () => {
        if (cartItems.length === 0) {
            setErrorMessage(i18n.t("sales.errors.addProduct"));
            return;
        }

        const parsedPaid = Number(String(paidAmount).replace(/,/g, "")) || 0;
        const total = totals.total;

        if (paymentMethod === "credit" && !selectedCustomer) {
            setErrorMessage(i18n.t("sales.errors.customerRequired"));
            return;
        }

        setErrorMessage("");
        setSaving(true);

        try {
            const items = cartItems.map((item) => ({
                product: item.product,
                quantity: item.qty,
                sellingPrice: item.price,
            }));

            const saleType =
                paymentMethod === "cash" || parsedPaid >= total
                    ? "cash"
                    : "credit";

            const initialPayment =
                saleType === "credit" && parsedPaid > 0 ? parsedPaid : null;

            await createSale(
                selectedCustomer?.model || null,
                saleType,
                items,
                saleTimestamp,
                initialPayment,
            );

            router.back();
        } catch (error) {
            console.error("Failed to create sale", error);
            setErrorMessage(i18n.t("sales.errors.completeSale"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: i18n.t("sales.new.title"),
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontWeight: "700",
                        fontSize: 20,
                    },
                }}
            />
            <FormScreen contentContainerStyle={styles.container}>
                <Button
                    mode="outlined"
                    icon="plus"
                    onPress={() => setAddProductVisible(true)}
                    style={styles.addProductButton}
                >
                    {i18n.t("sales.new.addProduct")}
                </Button>

                <Portal>
                    <Modal
                        visible={addProductVisible}
                        onDismiss={() => setAddProductVisible(false)}
                        style={styles.modalBottom}
                        contentContainerStyle={styles.modalContainer}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {i18n.t("sales.new.addProducts")}
                            </Text>
                            <IconButton
                                icon="close"
                                size={20}
                                onPress={() => setAddProductVisible(false)}
                            />
                        </View>
                        <SearchBar
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                        />
                        <View style={styles.modalList}>
                            {loading ? (
                                <View style={styles.modalLoading}>
                                    <ActivityIndicator animating />
                                    <Text style={styles.modalEmpty}>
                                        {i18n.t("sales.new.loadingProducts")}
                                    </Text>
                                </View>
                            ) : filteredProducts.length === 0 ? (
                                <Text style={styles.modalEmpty}>
                                    {i18n.t("sales.new.noMatches")}
                                </Text>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TouchableRipple
                                        key={product.id}
                                        onPress={() =>
                                            handleSelectProduct(product)
                                        }
                                        borderless
                                        style={styles.suggestionRow}
                                    >
                                        <View style={styles.modalItemRow}>
                                            <Text style={styles.suggestionText}>
                                                {product.name}
                                            </Text>
                                            <Text style={styles.modalPrice}>
                                                {product.defaultSellingPrice.toLocaleString()}{" "}
                                                {currencyPrefix}
                                            </Text>
                                        </View>
                                    </TouchableRipple>
                                ))
                            )}
                        </View>
                        {selectedProduct && (
                            <View style={styles.modalEditor}>
                                <Text style={styles.modalSectionTitle}>
                                    {i18n.t("sales.new.selected")}{" "}
                                    {selectedProduct.name}
                                </Text>
                                <View style={styles.modalFieldRow}>
                                    <TextInput
                                        mode="outlined"
                                        label={i18n.t("common.labels.quantity")}
                                        value={addQty}
                                        onChangeText={(text) =>
                                            setAddQty(text.replace(/\D/g, ""))
                                        }
                                        keyboardType="numeric"
                                        style={styles.modalField}
                                    />
                                    <TextInput
                                        mode="outlined"
                                        label={i18n.t(
                                            "common.labels.sellingPrice",
                                        )}
                                        value={addPrice}
                                        onChangeText={(text) =>
                                            setAddPrice(
                                                text.replace(/[^\d.]/g, ""),
                                            )
                                        }
                                        keyboardType="numeric"
                                        style={styles.modalField}
                                        right={
                                            <TextInput.Affix
                                                text={currencyPrefix}
                                            />
                                        }
                                    />
                                </View>
                                <Button
                                    mode="contained"
                                    onPress={handleAddToCart}
                                >
                                    {i18n.t("sales.new.addToCart")}
                                </Button>
                            </View>
                        )}
                    </Modal>
                    <Modal
                        visible={Boolean(editItem)}
                        onDismiss={() => setEditItem(null)}
                        style={styles.modalBottom}
                        contentContainerStyle={styles.modalContainer}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {i18n.t("sales.details.editItem")}
                            </Text>
                            <IconButton
                                icon="close"
                                size={20}
                                onPress={() => setEditItem(null)}
                            />
                        </View>
                        {editItem && (
                            <View style={styles.modalEditor}>
                                <Text style={styles.modalSectionTitle}>
                                    {editItem.name}
                                </Text>
                                <View style={styles.modalFieldRow}>
                                    <TextInput
                                        mode="outlined"
                                        label={i18n.t("common.labels.quantity")}
                                        value={editQty}
                                        onChangeText={(text) =>
                                            setEditQty(text.replace(/\D/g, ""))
                                        }
                                        keyboardType="numeric"
                                        style={styles.modalField}
                                    />
                                    <TextInput
                                        mode="outlined"
                                        label={i18n.t(
                                            "common.labels.sellingPrice",
                                        )}
                                        value={editPrice}
                                        onChangeText={(text) =>
                                            setEditPrice(
                                                text.replace(/[^\d.]/g, ""),
                                            )
                                        }
                                        keyboardType="numeric"
                                        style={styles.modalField}
                                        right={
                                            <TextInput.Affix
                                                text={currencyPrefix}
                                            />
                                        }
                                    />
                                </View>
                                <Button
                                    mode="contained"
                                    onPress={handleSaveEdit}
                                >
                                    {i18n.t("sales.new.saveChanges")}
                                </Button>
                            </View>
                        )}
                    </Modal>
                </Portal>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>
                        {i18n.t("sales.new.cartItems")}
                    </Text>
                    <Text style={styles.sectionMeta}>
                        {i18n.t("sales.new.productsCount", {
                            count: cartItems.length,
                        })}
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
                                    <Text style={styles.itemName}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.itemMeta}>
                                        {item.price.toLocaleString()}{" "}
                                        {currencyPrefix}
                                    </Text>
                                </View>
                                <View style={styles.qtyPill}>
                                    <Text style={styles.qtyPillText}>
                                        {item.qty}{" "}
                                        {i18n.t("common.labels.units")}
                                    </Text>
                                </View>
                                <IconButton
                                    icon="pencil-outline"
                                    size={18}
                                    onPress={() => handleEditItem(item)}
                                />
                                <IconButton
                                    icon="trash-can-outline"
                                    size={18}
                                    onPress={() =>
                                        setCartItems((prev) =>
                                            prev.filter(
                                                (row) => row.id !== item.id,
                                            ),
                                        )
                                    }
                                />
                            </View>
                        ))}
                    </Card.Content>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>
                        {i18n.t("sales.details.dateTime")}
                    </Text>
                </View>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.dateTimeRow}>
                            <Button
                                mode="outlined"
                                onPress={() => setDatePickerOpen(true)}
                                style={styles.dateTimeButton}
                            >
                                {formatEthiopianDate(saleTimestamp)}
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => setTimePickerOpen(true)}
                                style={styles.dateTimeButton}
                            >
                                {formatEthiopianTime(saleTimestamp, {
                                    day: i18n.t("common.timePeriods.day"),
                                    night: i18n.t("common.timePeriods.night"),
                                })}
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>
                        {i18n.t("sales.new.customer")}
                    </Text>
                    <Button
                        mode="text"
                        onPress={() => setCustomerModalVisible(true)}
                        labelStyle={styles.linkButton}
                        compact
                    >
                        {i18n.t("common.actions.select")}
                    </Button>
                </View>
                <Card style={styles.card}>
                    <Card.Content style={{ gap: 12 }}>
                        <TouchableRipple
                            onPress={() => setCustomerModalVisible(true)}
                            style={styles.customerPressable}
                        >
                            <View style={styles.customerRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>
                                        {selectedCustomer?.name ??
                                            i18n.t("sales.new.selectCustomer")}
                                    </Text>
                                    <Text style={styles.itemMeta}>
                                        {selectedCustomer?.phone ??
                                            i18n.t("sales.new.customerPhone")}
                                    </Text>
                                </View>
                                <IconButton
                                    icon="account-search-outline"
                                    size={20}
                                    onPress={() =>
                                        setCustomerModalVisible(true)
                                    }
                                />
                            </View>
                        </TouchableRipple>
                        {paymentMethod === "credit" && !selectedCustomer && (
                            <View style={styles.alertPill}>
                                <Icon
                                    source="alert"
                                    size={16}
                                    color={theme.colors.warning}
                                />
                                <Text style={styles.alertText}>
                                    {i18n.t("sales.errors.customerRequired")}
                                </Text>
                            </View>
                        )}
                        {selectedCustomer?.balance > 0 && (
                            <View style={styles.alertPill}>
                                <Icon
                                    source="alert"
                                    size={16}
                                    color={theme.colors.warning}
                                />
                                <Text style={styles.alertText}>
                                    {i18n.t("sales.new.outstandingBalance")}{" "}
                                    {selectedCustomer.balance.toLocaleString()}{" "}
                                    {currencyPrefix}
                                </Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>
                        {i18n.t("sales.new.paymentMethod")}
                    </Text>
                </View>
                <Card style={styles.card}>
                    <Card.Content style={{ gap: 12 }}>
                        <View style={styles.paymentRow}>
                            <Chip
                                icon="cash"
                                selected={paymentMethod === "cash"}
                                onPress={() => setPaymentMethod("cash")}
                                mode={
                                    paymentMethod === "cash"
                                        ? "flat"
                                        : "outlined"
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
                                {i18n.t("common.status.cash")}
                            </Chip>
                            <Chip
                                icon="credit-card"
                                selected={paymentMethod === "credit"}
                                onPress={() => setPaymentMethod("credit")}
                                mode={
                                    paymentMethod === "credit"
                                        ? "flat"
                                        : "outlined"
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
                                {i18n.t("common.status.credit")}
                            </Chip>
                        </View>

                        <View>
                            <Text style={styles.sectionLabel}>
                                {i18n.t("sales.new.paidAmount")}
                            </Text>
                            <TextInput
                                mode="outlined"
                                value={paidAmount}
                                onChangeText={setPaidAmount}
                                keyboardType="numeric"
                                outlineColor="#E5E7EB"
                                activeOutlineColor={theme.colors.primary}
                                style={styles.input}
                                right={
                                    <TextInput.Affix text={currencyPrefix} />
                                }
                            />
                            <Text style={styles.helperText}>
                                {i18n.t("common.labels.subtotal")}:{" "}
                                {totals.total.toLocaleString()} {currencyPrefix}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.summaryCard}>
                    <Card.Content style={styles.summaryRow}>
                        <View>
                            <Text style={styles.sectionLabel}>
                                {i18n.t("common.labels.totalPayable")}
                            </Text>
                            <Text style={styles.totalValue}>
                                {totals.total.toLocaleString()} {currencyPrefix}
                            </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                            <Text style={styles.sectionLabel}>
                                {i18n.t("common.labels.itemsCount")}
                            </Text>
                            <Text style={styles.itemsValue}>
                                {totals.items} {i18n.t("common.labels.units")}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </FormScreen>
            <View style={styles.footer}>
                <Button
                    mode="contained"
                    icon="check"
                    style={styles.submitButton}
                    onPress={handleSubmitSale}
                    loading={saving}
                    disabled={saving}
                >
                    {i18n.t("sales.new.completeSale")}
                </Button>
                {!!errorMessage && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                )}
            </View>

            <Portal>
                <Modal
                    visible={customerModalVisible}
                    onDismiss={() => setCustomerModalVisible(false)}
                    style={styles.modalBottom}
                    contentContainerStyle={styles.modalContainer}
                >
                    <ScrollView
                        contentContainerStyle={styles.modalScroll}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {i18n.t("sales.details.selectCustomerTitle")}
                            </Text>
                            <IconButton
                                icon="close"
                                size={20}
                                onPress={() => setCustomerModalVisible(false)}
                            />
                        </View>
                        <TextInput
                            mode="outlined"
                            value={customerQuery}
                            onChangeText={setCustomerQuery}
                            placeholder={i18n.t(
                                "sales.details.searchCustomersPlaceholder",
                            )}
                            outlineColor="#E5E7EB"
                            activeOutlineColor={theme.colors.primary}
                            style={styles.search}
                            left={<TextInput.Icon icon="magnify" />}
                        />
                        <View style={styles.modalList}>
                            {loading ? (
                                <View style={styles.modalLoading}>
                                    <ActivityIndicator animating />
                                    <Text style={styles.modalEmpty}>
                                        {i18n.t("sales.new.loadingCustomers")}
                                    </Text>
                                </View>
                            ) : filteredCustomers.length === 0 ? (
                                <Text style={styles.modalEmpty}>
                                    {i18n.t("sales.new.noCustomersFound")}
                                </Text>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TouchableRipple
                                        key={customer.id}
                                        onPress={() =>
                                            handleSelectCustomer(customer)
                                        }
                                        borderless
                                        style={styles.suggestionRow}
                                    >
                                        <View style={styles.modalItemRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={
                                                        styles.suggestionText
                                                    }
                                                >
                                                    {customer.name}
                                                </Text>
                                                <Text
                                                    style={styles.modalSubText}
                                                >
                                                    {customer.phone}
                                                </Text>
                                            </View>
                                            <Text style={styles.modalPrice}>
                                                {currencyPrefix}{" "}
                                                {customer.balance.toLocaleString()}
                                            </Text>
                                        </View>
                                    </TouchableRipple>
                                ))
                            )}
                        </View>
                        <Button
                            mode="outlined"
                            icon="account-plus-outline"
                            onPress={() =>
                                setAddCustomerVisible((prev) => !prev)
                            }
                            style={styles.addCustomerButton}
                        >
                            {addCustomerVisible
                                ? i18n.t("sales.new.close")
                                : i18n.t("sales.new.addNewCustomer")}
                        </Button>
                        {addCustomerVisible && (
                            <View style={styles.modalEditor}>
                                <Text style={styles.modalSectionTitle}>
                                    {i18n.t("sales.new.newCustomer")}
                                </Text>
                                <TextInput
                                    mode="outlined"
                                    label={i18n.t("common.labels.name")}
                                    value={newCustomerName}
                                    onChangeText={setNewCustomerName}
                                    style={styles.modalField}
                                />
                                <TextInput
                                    mode="outlined"
                                    label={i18n.t("common.labels.phone")}
                                    value={newCustomerPhone}
                                    onChangeText={setNewCustomerPhone}
                                    keyboardType="phone-pad"
                                    style={styles.modalField}
                                />
                                <Button
                                    mode="contained"
                                    onPress={handleAddCustomer}
                                >
                                    {i18n.t("sales.details.saveCustomer")}
                                </Button>
                            </View>
                        )}
                    </ScrollView>
                </Modal>
            </Portal>

            <EthiopianDatePicker
                visible={datePickerOpen}
                value={saleTimestamp}
                onDismiss={() => setDatePickerOpen(false)}
                onConfirm={({ year, month, day }) => {
                    const current = timestampToEthiopianParts(saleTimestamp);
                    const timestamp = ethiopianDateTimeToTimestamp({
                        year,
                        month,
                        day,
                        hour: current.hour,
                        minute: current.minute,
                        period: current.period,
                    });
                    setSaleTimestamp(timestamp);
                    setDatePickerOpen(false);
                }}
            />

            <EthiopianTimePicker
                visible={timePickerOpen}
                value={saleTimestamp}
                onDismiss={() => setTimePickerOpen(false)}
                onConfirm={({ hour, minute, period }) => {
                    const current = timestampToEthiopianParts(saleTimestamp);
                    const timestamp = ethiopianDateTimeToTimestamp({
                        year: current.year,
                        month: current.month,
                        day: current.day,
                        hour,
                        minute,
                        period,
                    });
                    setSaleTimestamp(timestamp);
                    setTimePickerOpen(false);
                }}
            />
        </>
    );
};

const SearchBar = ({
    value,
    onChangeText,
    onFocus,
    onBlur,
    readOnly,
    autoFocus,
}) => (
    <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        editable={!readOnly}
        autoFocus={autoFocus}
        placeholder={i18n.t("sales.new.searchProductsPlaceholder")}
        outlineColor="#E5E7EB"
        activeOutlineColor={theme.colors.primary}
        style={styles.search}
        left={<TextInput.Icon icon="magnify" />}
    />
);

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingBottom: 160,
        flex: 1,
    },
    page: {
        flex: 1,
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
    addProductButton: {
        borderRadius: 14,
        borderColor: "#E5E7EB",
    },
    linkButton: {
        color: theme.colors.primary,
        fontWeight: "600",
    },
    suggestionCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    suggestionContent: {
        paddingVertical: 4,
        gap: 4,
    },
    suggestionRow: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    suggestionText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    modalContainer: {
        marginHorizontal: 0,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 16,
        paddingBottom: 24,
    },
    modalScroll: {
        paddingBottom: 8,
        gap: 12,
    },
    modalBottom: {
        justifyContent: "flex-end",
        margin: 0,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    modalTitle: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 16,
    },
    modalList: {
        marginTop: 12,
        gap: 6,
    },
    modalItemRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    modalPrice: {
        color: theme.colors.onSurface,
        fontSize: 12,
        fontWeight: "600",
    },
    modalSubText: {
        color: theme.colors.onSurface,
        fontSize: 12,
        marginTop: 2,
    },
    modalEmpty: {
        color: theme.colors.onSurface,
        fontSize: 12,
        textAlign: "center",
        paddingVertical: 12,
    },
    modalLoading: {
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
    },
    modalEditor: {
        marginTop: 16,
        gap: 12,
    },
    modalSectionTitle: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    modalFieldRow: {
        flexDirection: "row",
        gap: 12,
    },
    modalField: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    addCustomerButton: {
        marginTop: 12,
        borderRadius: 12,
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
    dateTimeRow: {
        flexDirection: "row",
        gap: 12,
    },
    dateTimeButton: {
        flex: 1,
        borderRadius: 12,
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
    qtyPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryContainer,
    },
    qtyPillText: {
        color: theme.colors.text,
        fontWeight: "700",
        fontSize: 12,
    },
    customerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    customerPressable: {
        borderRadius: 12,
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
    footer: {
        marginTop: "auto",
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        textAlign: "center",
        marginTop: 8,
    },
});

export default NewSaleScreen;
