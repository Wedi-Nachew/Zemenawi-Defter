import { StyleSheet, View } from "react-native";
import { Card, Icon, Text } from "react-native-paper";
import i18n from "../i18n";
import theme from "../theme";

const RecentSaleItem = ({ customerName, amount, time, type }) => {
    const meta =
        type === "credit"
            ? {
                  icon: "account",
                  bg: "#E0EAFF",
                  iconColor: theme.colors.primary,
                  label: i18n.t("home.sales.creditLabel"),
                  dot: "#F59E0B",
              }
            : {
                  icon: "cash",
                  bg: "#E7F5ED",
                  iconColor: theme.colors.secondary,
                  label: i18n.t("home.sales.cashLabel"),
                  dot: null,
              };

    return (
        <Card style={styles.card} mode="contained">
            <Card.Content style={styles.container}>
                <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                    <Icon source={meta.icon} color={meta.iconColor} size={22} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name} variant="bodyLarge">
                        {customerName}
                    </Text>
                    <View style={styles.metaRow}>
                        {meta.dot && (
                            <View
                                style={[
                                    styles.dot,
                                    { backgroundColor: meta.dot },
                                ]}
                            />
                        )}
                        <Text style={styles.meta}>{meta.label}</Text>
                    </View>
                </View>
                <View style={styles.right}>
                    <Text style={styles.amount}>
                        {i18n.t("home.stats.currencyPrefix")}{" "}
                        {amount.toLocaleString()}
                    </Text>
                    <Text style={styles.time}>{time}</Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        marginVertical: 6,
        elevation: 3,
        shadowColor: "transparent",
        shadowOpacity: 0.1,
        shadowRadius: 1,
        shadowOffset: { width: 0, height: 1 },
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconWrap: {
        width: 46,
        height: 46,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    info: {
        flex: 1,
    },
    name: {
        fontWeight: "700",
        color: theme.colors.text,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
    },
    meta: {
        color: "#6B7280",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 8,
    },
    right: {
        alignItems: "flex-end",
        gap: 2,
    },
    amount: {
        fontWeight: "700",
        color: theme.colors.text,
    },
    time: {
        color: "#6B7280",
    },
});

export default RecentSaleItem;
