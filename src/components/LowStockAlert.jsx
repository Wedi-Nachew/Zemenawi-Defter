import { StyleSheet, View } from "react-native";

import { Button, Card, Divider, Icon, Text } from "react-native-paper";
import theme from "../theme";

const LowStockAlert = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Low Stock Alerts</Text>
                    <Icon
                        source="alert"
                        color={theme.colors.warning}
                        size={20}
                    />
                </View>
                <Button
                    mode="text"
                    onPress={() => {}}
                    labelStyle={styles.viewInventoryLabel}
                    compact
                >
                    View Inventory
                </Button>
            </View>
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    {items.map((item, index) => (
                        <View key={item.id} style={styles.item}>
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: item.iconBg },
                                ]}
                            >
                                <Icon
                                    source={item.icon}
                                    color={item.iconColor}
                                    size={20}
                                />
                            </View>
                            <View style={styles.itemInfo}>
                                <Text variant="bodyMedium" style={styles.name}>
                                    {item.name}
                                </Text>
                                <Text variant="bodyMedium" style={styles.qty}>
                                    {item.stock}
                                </Text>
                            </View>
                            {index < items.length - 1 && <Divider />}
                        </View>
                    ))}
                </Card.Content>
            </Card>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 36,
        marginBottom: 20,
        elevation: 0,
    },
    cardContent: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        color: theme.colors.text,
        fontWeight: "bold",
        marginLeft: 8,
        fontSize: 20,
    },
    viewInventoryLabel: {
        fontSize: 14,
        color: "#2563EB",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 1,
        paddingVertical: 12,
        gap: 12,
    },
    itemInfo: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    name: {
        fontWeight: "bold",
        fontSize: 16,
        color: theme.colors.text,
    },
    qty: {
        color: theme.colors.error,
        fontWeight: "bold",
    },
});

export default LowStockAlert;
