import { createContext, useContext, useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import {
    deleteCurrentUser,
    onAuthStateChanged,
    signOut,
} from "../firebase/authService";
import {
    createTrialSubscription,
    getSubscription,
} from "../firebase/subscription";
import { createUserProfile, getUserProfile } from "../firebase/userService";

const AuthContext = createContext(null);

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);

    // Handle auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // User is signed in
                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        phone: firebaseUser.phoneNumber,
                    };

                    setUser(userData);

                    // Load user profile
                    const profileResult = await getUserProfile(
                        firebaseUser.uid,
                    );
                    if (profileResult.success) {
                        setUserProfile(profileResult.data);
                    }

                    // Load subscription
                    const subscriptionResult = await getSubscription(
                        firebaseUser.uid,
                    );
                    if (subscriptionResult.success) {
                        setSubscription(subscriptionResult.data);
                    }
                } else {
                    // User is signed out
                    setUser(null);
                    setUserProfile(null);
                    setSubscription(null);
                }
            } catch (error) {
                console.log("Auth state change error", error);
            } finally {
                setLoading(false);
                if (initializing) {
                    setInitializing(false);
                }
            }
        });

        return unsubscribe;
    }, [initializing]);

    // Sign up with profile and trial creation
    const signUp = async (email, password, userData) => {
        setLoading(true);
        try {
            // import here to avoid circular dependency
            const { signUp: authSignUp } =
                await import("../firebase/authService");
            // Create auth user
            const authResult = await authSignUp(email, password, userData);

            if (!authResult.success) {
                setLoading(false);
                return authResult;
            }

            // Create user profile
            const profileResult = await createUserProfile(
                authResult.user.uid,
                userData,
            );
            if (!profileResult.success) {
                await deleteCurrentUser();
                setLoading(false);
                return profileResult;
            }

            // Create trial subscription
            const trialResult = await createTrialSubscription(
                authResult.user.uid,
            );
            if (!trialResult.success) {
                await deleteCurrentUser();
                setLoading(false);
                return trialResult;
            }
            setLoading(false);
            return {
                success: true,
                user: authResult.user,
            };
        } catch (error) {
            console.log("Signup error", error);
            setLoading(false);
            return {
                success: false,
                error: "Failed to create account",
            };
        }
    };

    // Sign in
    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const { signIn: authSignIn } =
                await import("../firebase/authService");
            const authResult = await authSignIn(email, password);
            setLoading(false);
            return authResult;
        } catch (error) {
            console.log("Signin error:", error);
            setLoading(false);
            return {
                success: false,
                error: "Failed to sign in",
            };
        }
    };

    // Sign out
    const handleSignOut = async () => {
        setLoading(true);
        try {
            const result = await signOut();
            if (result.success) {
            }
            setLoading(false);
            return result;
        } catch (error) {
            console.log("Signout error:", error);
            setLoading(false);
            return {
                success: false,
                error: "Failed to sign out",
            };
        }
    };

    // Reset password
    const resetPassword = async (email) => {
        try {
            const { resetPassword: authResetPassword } =
                await import("../firebase/authService");
            return await authResetPassword(email);
        } catch (error) {
            console.log("Reset password error:", error);
            return {
                success: false,
                error: "Failed to reset password",
            };
        }
    };

    // Update user profile
    const updateUserProfile = async (updateData) => {
        if (!user) {
            return {
                success: false,
                error: "No user logged in",
            };
        }

        try {
            const { updateUserProfile: updateProfile } =
                await import("../firebase/userService");
            const result = await updateProfile(user.uid, updateData);

            if (result.success) {
                // Refresh user profile
                const profileResult = await getUserProfile(user.uid);
                if (profileResult.success) {
                    setUserProfile(profileResult.data);
                }
            }

            return result;
        } catch (error) {
            console.log("Update user profile error:", error);
            return {
                success: false,
                error: "Failed to update user profile",
            };
        }
    };

    const value = {
        user,
        userProfile,
        subscription,
        loading,
        initializing,
        signUp,
        signIn,
        signOut: handleSignOut,
        resetPassword,
        updateUserProfile,
        isAuthenticated: !!user,
    };

    // Show loading screen while initializing
    if (initializing) {
        return <LoadingScreen message="Initializing..." />;
    }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export { AuthProvider, useAuth };
