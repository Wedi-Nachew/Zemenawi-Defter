import { Stack } from "expo-router";
import { useMemo } from "react";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";

const CreditsLayout = () => {
    const { language } = useLanguage();
    const labels = useMemo(
        () => ({
            details: i18n.t("credits.details.title"),
            payment: i18n.t("credits.payment.title"),
            success: i18n.t("credits.success.title"),
        }),
        [language],
    );
    return (
        <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen name="details" options={{ title: labels.details }} />
            <Stack.Screen name="payment" options={{ title: labels.payment }} />
            <Stack.Screen
                name="payment-success"
                options={{ title: labels.success }}
            />
        </Stack>
    );
};

export default CreditsLayout;
