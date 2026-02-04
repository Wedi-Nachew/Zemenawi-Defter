import { Stack } from "expo-router";

const InventoryLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen
                name="details"
                options={{ title: "Product Details" }}
            />
            <Stack.Screen name="new" options={{ title: "Add New Product" }} />
        </Stack>
    );
};

export default InventoryLayout;
