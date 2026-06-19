import { loginUser } from '@/data/auth';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Ingresa tu correo y contraseña.');
      return;
    }

    try {
      await loginUser(email, password);
      router.replace('/dashboard');
    } catch {
      Alert.alert('Error al iniciar sesión', 'Correo o contraseña incorrectos.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>FinGo</Text>
          <Text style={styles.tagline}>Gestiona tus finanzas personales</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Bienvenido 👋</Text>
          <Text style={styles.subtitle}>
            Ingresa a tu cuenta para revisar tus ingresos, gastos y estadísticas.
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            placeholderTextColor="#94A3B8"
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ingresa tu contraseña"
              secureTextEntry={!showPassword}
              value={password}
              placeholderTextColor="#94A3B8"
              onChangeText={setPassword}
              
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </Pressable>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryText}>Ingresar</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
            <Link href="/register" style={styles.linkText}>
              Crear cuenta
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 90,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  logo: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    elevation: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1E293B',
  },
  passwordContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eyeText: {
    fontSize: 20,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 22,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 15,
    marginBottom: 6,
  },
  linkText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
  },
});