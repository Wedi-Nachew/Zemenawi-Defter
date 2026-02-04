import { Stack } from "expo-router";

const SalesLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Sales History" }} />
            <Stack.Screen name="details" options={{ title: "Sale Details" }} />
            <Stack.Screen name="new" options={{ title: "New Sale" }} />
        </Stack>
    );
};

export default SalesLayout;
