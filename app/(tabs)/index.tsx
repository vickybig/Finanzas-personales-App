import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💰</Text>

      <Text style={styles.title}>FinanzApp Ecuador</Text>

      <Text style={styles.subtitle}>
        Controla tus ingresos, gastos y presupuestos desde tu celular.
      </Text>

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryText}>Iniciar Sesión</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Crear Cuenta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
  },
  logo: {
    fontSize: 70,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
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