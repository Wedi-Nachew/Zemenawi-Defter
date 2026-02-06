import { Stack } from "expo-router";
import { useMemo } from "react";
import i18n from "../../../src/i18n";
import { useLanguage } from "../../../src/i18n/LanguageContext";

const InventoryLayout = () => {
    const { language } = useLanguage();
    const labels = useMemo(
        () => ({
            details: i18n.t("inventory.details.title"),
            addNew: i18n.t("inventory.new.title"),
        }),
        [language],
    );
    return (
        <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen name="details" options={{ title: labels.details }} />
            <Stack.Screen name="new" options={{ title: labels.addNew }} />
        </Stack>
    );
};

export default InventoryLayout;
