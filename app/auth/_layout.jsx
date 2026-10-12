import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import LoadingScreen from "../../src/components/LoadingScreen";

const AuthLayout = () => {
    const { initializing, user } = useAuth();

    // Show loading screen during initialization
    if (initializing) {
        return <LoadingScreen message="Initializing..." />;
    }

    // If user is authenticated, redirect to app
    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    // Show auth screens
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="splash" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="login" />
            <Stack.Screen name="forgot-password" />
        </Stack>
    );
};

export default AuthLayout;
