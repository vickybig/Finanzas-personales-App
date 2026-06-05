import { getCurrentUser } from '@/data/auth';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const user = await getCurrentUser();

      if (user) {
        router.replace('/dashboard');
      }
    }

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💰</Text>

      <Text style={styles.title}>FinGo</Text>

      <Text style={styles.subtitle}>
        Controla tus ingresos, gastos y presupuestos desde tu celular.
      </Text>

      <Link href="/login" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryText}>Iniciar Sesión</Text>
        </Pressable>
      </Link>

      <Link href="/register" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Crear Cuenta</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F4F7FB',
  },
  logo: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderColor: '#2563EB',
    borderWidth: 2,
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
  },
});