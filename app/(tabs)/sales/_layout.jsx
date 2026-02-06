import { Stack } from "expo-router";
import { useMemo } from "react";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";

const SalesLayout = () => {
    const { language } = useLanguage();
    const labels = useMemo(
        () => ({
            history: i18n.t("sales.title"),
            details: i18n.t("sales.details.title"),
            newSale: i18n.t("sales.new.title"),
        }),
        [language],
    );
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: labels.history }} />
            <Stack.Screen name="details" options={{ title: labels.details }} />
            <Stack.Screen name="new" options={{ title: labels.newSale }} />
        </Stack>
    );
};

export default SalesLayout;
