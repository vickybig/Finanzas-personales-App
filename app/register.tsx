import { registerUser } from '@/data/auth';
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

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function hasUppercase(value: string) {
    return /[A-ZÁÉÍÓÚÑ]/.test(value);
  }

  function hasNumber(value: string) {
    return /\d/.test(value);
  }

  function getPasswordStrength(value: string) {
    let score = 0;

    if (value.length >= 6) score++;
    if (hasUppercase(value)) score++;
    if (hasNumber(value)) score++;
    if (value.length >= 8) score++;

    if (!value) {
      return {
        label: 'Sin contraseña',
        color: '#CBD5E1',
        width: '0%',
      };
    }

    if (score <= 1) {
      return {
        label: 'Débil',
        color: '#EF4444',
        width: '33%',
      };
    }

    if (score <= 3) {
      return {
        label: 'Media',
        color: '#F59E0B',
        width: '66%',
      };
    }

    return {
      label: 'Fuerte',
      color: '#10B981',
      width: '100%',
    };
  }

  const passwordStrength = getPasswordStrength(password);

  async function handleRegister() {
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Campos incompletos', 'Completa todos los campos.');
      return;
    }

    if (!nameRegex.test(name.trim())) {
      Alert.alert(
        'Nombre inválido',
        'El nombre solo debe contener letras. No se permiten números ni caracteres especiales.'
      );
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Correo inválido', 'Ingresa un correo válido.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!hasUppercase(password)) {
      Alert.alert(
        'Contraseña incompleta',
        'La contraseña debe tener al menos una letra mayúscula.'
      );
      return;
    }

    if (!hasNumber(password)) {
      Alert.alert(
        'Contraseña incompleta',
        'La contraseña debe tener al menos un número.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Contraseñas diferentes', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      await registerUser(name.trim(), email.trim(), password);
      Alert.alert('Cuenta creada', 'Tu cuenta fue registrada correctamente.');
      router.replace('/dashboard');
    } catch {
      Alert.alert('Error', 'Ya existe una cuenta con este correo.');
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
          <Text style={styles.tagline}>Empieza a ordenar tu dinero</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para controlar tus ingresos, gastos y hábitos financieros.
          </Text>

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Victor Vicente"
            value={name}
            placeholderTextColor="#94A3B8"
            onChangeText={setName}
          />

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
              placeholder="Crea una contraseña"
              secureTextEntry={!showPassword}
              value={password}
              placeholderTextColor="#94A3B8"
              onChangeText={setPassword}
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          <View style={styles.strengthContainer}>
            <View style={styles.strengthHeader}>
              <Text style={styles.strengthLabel}>Seguridad de contraseña</Text>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>

            <View style={styles.strengthBarBackground}>
              <View
                style={[
                  styles.strengthBarFill,
                  {
                    width: passwordStrength.width as any,
                    backgroundColor: passwordStrength.color,
                  },
                ]}
              />
            </View>

            <Text style={styles.passwordHelp}>
              Debe tener mínimo 6 caracteres, una mayúscula y un número.
            </Text>
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repite tu contraseña"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              placeholderTextColor="#94A3B8"
              onChangeText={setConfirmPassword}
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeText}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </Text>
            </Pressable>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
            <Text style={styles.primaryText}>Registrarse</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
            <Link href="/login" style={styles.linkText}>
              Iniciar sesión
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
    paddingTop: 70,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
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
    marginBottom: 14,
    color: '#1E293B',
  },
  passwordContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    marginBottom: 10,
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
  strengthContainer: {
    marginBottom: 14,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  strengthText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  strengthBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 20,
  },
  passwordHelp: {
    fontSize: 12,
    color: '#64748B',
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