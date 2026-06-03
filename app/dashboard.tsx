import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getBalance, getTotalExpense, getTotalIncome } from '@/data/transactions';

export default function DashboardScreen() {
  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const balance = getBalance();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hola, Victor 👋</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Total</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ingresos</Text>
          <Text style={styles.income}>+${totalIncome.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Gastos</Text>
          <Text style={styles.expense}>-${totalExpense.toFixed(2)}</Text>
        </View>
      </View>

      <Link href="/add-income" asChild>
        <Pressable style={styles.incomeButton}>
          <Text style={styles.buttonText}>Registrar Ingreso</Text>
        </Pressable>
      </Link>

      <Link href="/add-expense" asChild>
        <Pressable style={styles.expenseButton}>
          <Text style={styles.buttonText}>Registrar Gasto</Text>
        </Pressable>
      </Link>

      <Text style={styles.sectionTitle}>Últimos Movimientos</Text>

      <View style={styles.movementCard}>
        <Text>💰 Salario +$500</Text>
      </View>

      <View style={styles.movementCard}>
        <Text>🛒 Supermercado -$80</Text>
      </View>

      <View style={styles.movementCard}>
        <Text>🚕 Transporte -$20</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 15,
    elevation: 2,
  },
  summaryTitle: {
    color: '#64748B',
    marginBottom: 8,
  },
  income: {
    color: '#16A34A',
    fontWeight: 'bold',
    fontSize: 18,
  },
  expense: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 18,
  },
  incomeButton: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1E293B',
  },
  movementCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
});