
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../src/auth/AuthProvider';
import FormScreen from '../../src/components/FormScreen';

const LoginScreen = () => {
    const router = useRouter();
    const {signIn, loading} = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if(!email.trim()) {
            newErrors.email = "Email is required";
        } else if(!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid";
        }

        if(!password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleLogin = async() => {
        if(!validateForm()) return;

        const result = await signIn(email, password);

        if(!result.success) {
            setErrors({general: result.error});
        }
    }

 return (
    <FormScreen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
 
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
 
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            error={!!errors.password}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>
 
          {errors.general && (
            <HelperText type="error" visible={!!errors.general}>
              {errors.general}
            </HelperText>
          )}
 
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
 
          <View style={styles.links}>
            <Button
              mode="text"
              onPress={() => router.push('/auth/forgot-password')}
              compact
            >
              Forgot Password?
            </Button>
            
            <Button
              mode="text"
              onPress={() => router.push('/auth/signup')}
              compact
            >
              Don't have an account? Sign Up
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

export default LoginScreen ;