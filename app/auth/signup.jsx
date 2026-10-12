import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { useAuth } from "../../src/auth/AuthProvider";
import FormScreen from "../../src/components/FormScreen";

const SignupScreen = () => {
    const router = useRouter();
    const { signUp, loading } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (formData.phone.trim() && !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone is invalid";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        const result = await signUp(formData.email, formData.password, {
            name: formData.name,
            phone: formData.phone.trim() || null,
        });

        if (!result.success) {
            setErrors({ general: result.error });
        }
    };

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // clear errprs for the field
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    return (
        <FormScreen style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join ZemenawiDefter today</Text>

                <View style={styles.form}>
                    <TextInput
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(value) => updateField("name", value)}
                        mode="outlined"
                        error={!!errors.name}
                        style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.name}>
                        {errors.name}
                    </HelperText>

                    <TextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(value) => updateField("email", value)}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email}
                        style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.email}>
                        {errors.email}
                    </HelperText>

                    <TextInput
                        label="Phone (Optional)"
                        value={formData.phone}
                        onChangeText={(value) => updateField("phone", value)}
                        mode="outlined"
                        keyboardType="phone"
                        error={!!errors.phone}
                        style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.phone}>
                        {errors.phone}
                    </HelperText>

                    <TextInput
                        label="Password"
                        value={formData.password}
                        onChangeText={(value) => updateField("password", value)}
                        mode="outlined"
                        secureTextEntry={!showPassword}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        error={!!errors.password}
                        style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.password}>
                        {errors.password}
                    </HelperText>

                    <TextInput
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChangeText={(value) =>
                            updateField("confirmPassword", value)
                        }
                        mode="outlined"
                        secureTextEntry={!showConfirmPassword}
                        right={
                            <TextInput.Icon
                                icon={showConfirmPassword ? "eye-off" : "eye"}
                                onPress={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            />
                        }
                        error={!!errors.confirmPassword}
                        style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.confirmPassword}>
                        {errors.confirmPassword}
                    </HelperText>

                    {errors.general && (
                        <HelperText type="error" visible={!!errors.general}>
                            {errors.general}
                        </HelperText>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleSignup}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Create Account
                    </Button>

                    <View style={styles.links}>
                        <Button
                            mode="text"
                            onPress={() => router.push("/auth/login")}
                            compact
                        >
                            Already have an account? Sign In
                        </Button>
                    </View>
                </View>
            </View>
        </FormScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: "#666",
        marginBottom: 32,
    },
    form: {
        width: "100%",
    },
    input: {
        marginBottom: 8,
    },
    button: {
        marginTop: 16,
        marginBottom: 24,
    },
    buttonContent: {
        height: 52,
    },
    links: {
        alignItems: "center",
        gap: 8,
    },
});

export default SignupScreen;
