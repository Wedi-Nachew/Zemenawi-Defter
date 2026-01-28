import { Stack } from "expo-router";

const CreditsLayout = () => {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: "Credits", headerShown: false }}
            />
            <Stack.Screen
                name="details"
                options={{ title: "Credit Details", headerShown: false }}
            />
            <Stack.Screen
                name="payment"
                options={{ title: "Make Payment", headerShown: false }}
            />
            <Stack.Screen
                name="payment-success"
                options={{ title: "Payment Success", headerShown: false }}
            />
        </Stack>
    );
};

export default CreditsLayout;
