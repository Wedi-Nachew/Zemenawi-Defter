import { router, Tabs } from "expo-router";
import { useMemo } from "react";
import { IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabBarIcon from "../../src/components/TabBarIcon";
import i18n from "../../src/i18n";
import { useLanguage } from "../../src/i18n/LanguageContext";
import theme from "../../src/theme";

const TabNavigator = () => {
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const labels = useMemo(
        () => ({
            home: "tabs.home",
            products: "tabs.products",
            sales: "tabs.sales",
            credits: "tabs.credits",
            reports: "tabs.reports",
            appTitle: "app.title",
            reportsTitle: "reports.headerTitle",
        }),
        [language],
    );

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.outline,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: "#EEEEEE",
                    elevation: 4,
                    height: 60 + insets.bottom,
                    paddingBottom: 8 + insets.bottom,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: i18n.t(labels.home),
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name="home"
                            color={color}
                            focused={focused}
                        />
                    ),
                    headerShown: true,
                    headerTitle: i18n.t(labels.appTitle),
                    headerTitleStyle: {
                        fontWeight: "700",
                        fontSize: 20,
                    },
                    headerRight: () => (
                        <IconButton
                            icon="cog"
                            size={22}
                            mode="contained"
                            containerColor="#E5E7EB"
                            iconColor="#6B7280"
                            onPress={() => router.push("/settings")}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    title: i18n.t(labels.products),
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name="archive"
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="sales"
                options={{
                    title: i18n.t(labels.sales),
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name="cart"
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="credits"
                options={{
                    title: i18n.t(labels.credits),
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name="wallet-bifold"
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: i18n.t(labels.reports),
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name="chart-box"
                            color={color}
                            focused={focused}
                        />
                    ),
                    headerShown: true,
                    headerTitle: i18n.t(labels.reportsTitle),
                    headerTitleStyle: {
                        fontSize: 22,
                        fontWeight: "700",
                    },
                }}
            />
        </Tabs>
    );
};

export default TabNavigator;
