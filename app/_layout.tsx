import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
    NotoSansEthiopic_400Regular,
    NotoSansEthiopic_500Medium,
    NotoSansEthiopic_600SemiBold,
    NotoSansEthiopic_700Bold,
} from "@expo-google-fonts/noto-sans-ethiopic";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/auth/AuthProvider";
import { LanguageProvider, useLanguage } from "../src/i18n/LanguageContext";
import { buildTheme } from "../src/theme/index";

const AppShell = () => {
    const { language } = useLanguage();
    const theme = buildTheme(language);

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <StatusBar barStyle="dark-content" />
                <Stack screenOptions={{ headerShown: false }} />
            </PaperProvider>
        </SafeAreaProvider>
    );
};

export default function RootLayout() {
    const [fontLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        NotoSansEthiopic_400Regular,
        NotoSansEthiopic_500Medium,
        NotoSansEthiopic_600SemiBold,
        NotoSansEthiopic_700Bold,
    });

    if (!fontLoaded) return null;

    return (
        <LanguageProvider>
            <AuthProvider>

            <AppShell />
            </AuthProvider>
        </LanguageProvider>
    );
}
