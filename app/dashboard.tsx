import {
  deleteTransaction,
  getBalance,
  getTotalExpense,
  getTotalIncome,
  loadTransactions,
  Transaction,
} from '@/data/transactions';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        setIsLoading(true);
        const savedTransactions = await loadTransactions();
        setTransactionList(savedTransactions || []);
        setIsLoading(false);
      }

      loadData();
    }, [])
  );

  async function handleDeleteTransaction(id: number) {
    Alert.alert(
      'Eliminar movimiento',
      '¿Estás seguro de que deseas eliminar esta transacción?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedTransactions = await deleteTransaction(id);
            setTransactionList(updatedTransactions);
          },
        },
      ]
    );
  }

  const totalIncome = getTotalIncome(transactionList);
  const totalExpense = getTotalExpense(transactionList);
  const balance = getBalance(transactionList);
  const latestTransactions = [...transactionList].reverse();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>Cargando FinGo...</Text>
      </View>
    );
  }

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

      <Link href="/statistics" asChild>
        <Pressable style={styles.statisticsButton}>
          <Text style={styles.buttonText}>Ver Estadísticas 📊</Text>
        </Pressable>
      </Link>

      <Text style={styles.sectionTitle}>Últimos Movimientos</Text>

      {latestTransactions.length === 0 ? (
        <Text style={styles.emptyText}>No hay movimientos registrados.</Text>
      ) : (
        latestTransactions.map((item) => (
          <View key={item.id} style={styles.movementCard}>
            <View style={styles.movementHeader}>
              <Text style={styles.movementText}>
                {item.type === 'income' ? '💰' : '💸'} {item.description}{' '}
                {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
              </Text>

              <View style={styles.actionsContainer}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/edit-transaction',
                      params: { id: String(item.id) },
                    })
                  }
                >
                  <Text style={styles.editText}>✏️</Text>
                </Pressable>

                <Pressable onPress={() => handleDeleteTransaction(item.id)}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.categoryText}>📂 {item.category}</Text>
          </View>
        ))
      )}
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
    marginBottom: 12,
  },
  statisticsButton: {
    backgroundColor: '#2563EB',
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
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movementText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editText: {
    fontSize: 20,
    marginLeft: 12,
  },
  deleteText: {
    fontSize: 20,
    marginLeft: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
});