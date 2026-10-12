import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../src/auth/AuthProvider';
import FormScreen from '../../src/components/FormScreen';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    const result = await resetPassword(email);
    if (result.success) {
      setSuccess(true);
    } else {
      setErrors({ general: result.error });
    }
  };

  if (success) {
    return (
      <FormScreen style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent password reset instructions to your email address.
          </Text>
          
          <Button
            mode="contained"
            onPress={() => router.replace('/auth/login')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Back to Login
          </Button>
        </View>
      </FormScreen>
    );
  }

  return (
    <FormScreen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          {errors.general && (
            <HelperText type="error" visible={!!errors.general}>
              {errors.general}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Send Reset Email
          </Button>

          <View style={styles.links}>
            <Button
              mode="text"
              onPress={() => router.replace('/auth/login')}
              compact
            >
              Back to Login
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: '100%',
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
    alignItems: 'center',
    gap: 8,
  },
});

export default ForgotPasswordScreen;