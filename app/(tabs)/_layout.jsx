import { router, Tabs } from "expo-router";
import { IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabBarIcon from "../../src/components/TabBarIcon";
import theme from "../../src/theme";

const TabNaviagtor = () => {
    const insets = useSafeAreaInsets();

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
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name="home"
                            color={color}
                            focused={focused}
                        />
                    ),
                    headerShown: true,
                    headerTitle: "Zemenawi Defter",
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
                    title: "Products",
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
                    title: "Sales",
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
                    title: "Credits",
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
                    title: "Reports",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name="chart-box"
                            color={color}
                            focused={focused}
                        />
                    ),
                    headerShown: true,
                    headerTitle: "Profit Analysis",
                    headerTitleStyle: {
                        fontSize: 22,
                        fontWeight: "700",
                    },
                }}
            />
        </Tabs>
    );
};

export default TabNaviagtor;
