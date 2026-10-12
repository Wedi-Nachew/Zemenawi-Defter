import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useAuth } from "../../src/auth/AuthProvider";
import LoadingScreen from "../../src/components/LoadingScreen";

const SplashScreen = () => {
    const router = useRouter();
    const { initializing, user } = useAuth();

    useEffect(() => {
        if (!initializing) {
            if (user) {
                // user is authenticated
                router.replace("/(tabs)");
            } else {
                // user is not authenticated, check if first time
                checkFirstTime();
            }
        }
    }, [initializing, user, router]);

    const checkFirstTime = () => {
        // For now, go directly to login
        // Later we have on boarding screens
        router.replace("/auth/login");
    };

    // Show loading screen while checking auth state
    return <LoadingScreen message="Loading..." />;
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default SplashScreen;
