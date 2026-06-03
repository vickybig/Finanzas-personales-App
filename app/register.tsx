import { Link } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>FinGo</Text>

      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>
        Regístrate para empezar a controlar tus finanzas personales.
      </Text>

      <TextInput style={styles.input} placeholder="Nombre completo" />
      <TextInput style={styles.input} placeholder="Correo electrónico" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirmar contraseña" secureTextEntry />

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryText}>Registrarse</Text>
      </TouchableOpacity>

      <Link href="/" style={styles.loginText}>
        ¿Ya tienes una cuenta? Iniciar sesión
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F4F7FB',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    textAlign: 'center',
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
});