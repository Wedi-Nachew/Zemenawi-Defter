import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Icon, Text } from "react-native-paper";
import Screen from "../../../src/components/Screen";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";
import theme from "../../../src/theme";

const creditCatalog = {
    c1: { id: "c1", name: "Tadesse Market", balance: 10000 },
    c2: { id: "c2", name: "Sara Tesfaye", balance: 4200 },
};

const PaymentSuccessScreen = () => {
    const { language } = useLanguage();
    const locale = language === "ti" ? "ti-ET" : "en";
    const currencyPrefix = i18n.t("common.currency.prefix");
    const { id, amount } = useLocalSearchParams();

    const receipt = useMemo(
        () => `#ZD-${Math.floor(8000 + Math.random() * 999)}`,
        [],
    );
    const customer = useMemo(
        () => (typeof id === "string" ? creditCatalog[id] : undefined),
        [id],
    );

    return (
        <Screen contentContainerStyle={styles.container}>
            <View style={styles.hero}>
                <View style={styles.checkWrap}>
                    <Icon source="check" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.heroTitle}>
                    {i18n.t("credits.success.title")}
                </Text>
                <Text style={styles.heroSubtitle}>
                    {i18n.t("credits.success.subtitle")}
                </Text>
            </View>

            <Card style={styles.receiptCard}>
                <Card.Content style={{ gap: 12 }}>
                    <View style={styles.amountBlock}>
                        <Text style={styles.amountLabel}>
                            {i18n.t("common.labels.amountPaid")}
                        </Text>
                        <Text style={styles.amountValue}>
                            {currencyPrefix}{" "}
                            {Number(amount || 0).toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.meta}>
                            {i18n.t("common.labels.receiptNo")}
                        </Text>
                        <Text style={styles.metaStrong}>{receipt}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.meta}>
                            {i18n.t("common.labels.customer")}
                        </Text>
                        <Text style={styles.metaStrong}>
                            {customer?.name ?? i18n.t("common.labels.customer")}
                        </Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.meta}>
                            {i18n.t("common.labels.date")}
                        </Text>
                        <Text style={styles.metaStrong}>
                            {new Date().toLocaleString(locale)}
                        </Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.meta}>
                            {i18n.t("common.labels.remainingBalance")}
                        </Text>
                        <Text style={styles.metaStrong}>
                            {currencyPrefix}{" "}
                            {customer?.balance?.toLocaleString() ?? "0"}
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={() => router.back()}
                style={styles.doneButton}
            >
                {i18n.t("common.actions.done")}
            </Button>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingBottom: 32,
    },
    hero: {
        backgroundColor: theme.colors.primary,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        gap: 8,
    },
    checkWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#22C55E",
        alignItems: "center",
        justifyContent: "center",
    },
    heroTitle: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 18,
    },
    heroSubtitle: {
        color: "#E0EAFF",
        fontSize: 12,
    },
    receiptCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        elevation: 0,
        borderWidth: 1,
        borderColor: "#EEF0F4",
    },
    amountBlock: {
        alignItems: "center",
        gap: 6,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#EEF0F4",
    },
    amountLabel: {
        color: theme.colors.onSurface,
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    amountValue: {
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: 22,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    meta: {
        color: theme.colors.onSurface,
        fontSize: 12,
    },
    metaStrong: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    doneButton: {
        borderRadius: 16,
    },
});

export default PaymentSuccessScreen;
