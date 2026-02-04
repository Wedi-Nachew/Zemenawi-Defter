import { Stack } from "expo-router";

const CreditsLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen
                name="details"
                options={{ title: "Credit Details" }}
            />
            <Stack.Screen name="payment" options={{ title: "Make Payment" }} />
            <Stack.Screen
                name="payment-success"
                options={{ title: "Payment Success" }}
            />
        </Stack>
    );
};

export default CreditsLayout;
