import { configureFonts, MD3LightTheme } from "react-native-paper";

const interFontConfig = {
    default: {
        regular: {
            fontFamily: "Inter_400Regular",
            fontWeight: "400",
        },
        medium: {
            fontFamily: "Inter_500Medium",
            fontWeight: "500",
        },
        semibold: {
            fontFamily: "Inter_600SemiBold",
            fontWeight: "600",
        },
        bold: {
            fontFamily: "Inter_700Bold",
            fontWeight: "700",
        },
    },
};

const ethiopicFontConfig = {
    default: {
        regular: {
            fontFamily: "NotoSansEthiopic_400Regular",
            fontWeight: "400",
        },
        medium: {
            fontFamily: "NotoSansEthiopic_500Medium",
            fontWeight: "500",
        },
        semibold: {
            fontFamily: "NotoSansEthiopic_600SemiBold",
            fontWeight: "600",
        },
        bold: {
            fontFamily: "NotoSansEthiopic_700Bold",
            fontWeight: "700",
        },
    },
};

const baseTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: "#2563EB",
        primaryContainer: "#E0EAFF",
        secondary: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        background: "#F3F4F5",
        surface: "#FFFFFF",
        text: "#111827",
        onSurface: "#6B7280",
    },
    roundness: 12,
};

const buildTheme = (language = "en") => {
    const fontConfig = language === "ti" ? ethiopicFontConfig : interFontConfig;
    return {
        ...baseTheme,
        fonts: configureFonts({ config: fontConfig }),
    };
};

const theme = buildTheme("en");

export { buildTheme };
export default theme;
