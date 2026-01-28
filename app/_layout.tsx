import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import theme from "../src/theme/index";

export default function RootLayout() {
    const [fontLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    if (!fontLoaded) return null;

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <StatusBar barStyle="dark-content" />
                <Stack screenOptions={{ headerShown: false }} />
            </PaperProvider>
        </SafeAreaProvider>
    );
}
