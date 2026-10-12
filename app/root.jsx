import { Redirect } from "expo-router";
import { useAuth } from "../src/auth/AuthProvider";
import LoadingScreen from "../src/components/LoadingScreen";

const RootNavigator = () => {
    const {initializing, user} = useAuth();

    // Show loading screen during initialization
    if(initializing) {
        return <LoadingScreen message="Loading..." />
    }

    // If user is not authenticated, redirect to auth
    if(!user) {
        return <Redirect href="/auth/splash" />
    }

    // If user is authenticated, redirect to app
    return <Redirect href="/(tabs)" />
}

export default RootNavigator;