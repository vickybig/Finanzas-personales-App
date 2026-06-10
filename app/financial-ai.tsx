import { getBalance, getTotalExpense, getTotalIncome, loadTransactions } from '@/data/transactions';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function FinancialAIScreen() {
  const router = useRouter();

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const transactions = await loadTransactions();

        setIncome(getTotalIncome(transactions));
        setExpense(getTotalExpense(transactions));
        setBalance(getBalance(transactions));
      }

      loadData();
    }, [])
  );

  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      <Text style={styles.appName}>FinGo</Text>
      <Text style={styles.title}>Analizador Financiero 🤖</Text>
      <Text style={styles.subtitle}>
        Revisión automática de tus ingresos, gastos y saldo disponible.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen inteligente</Text>

        <Text style={styles.item}>💰 Ingresos: ${income.toFixed(2)}</Text>
        <Text style={styles.item}>💸 Gastos: ${expense.toFixed(2)}</Text>
        <Text style={styles.item}>📊 Saldo: ${balance.toFixed(2)}</Text>
        <Text style={styles.item}>🏦 Tasa de ahorro: {savingsRate.toFixed(1)}%</Text>
      </View>

      <View style={styles.adviceCard}>
        <Text style={styles.cardTitle}>Consejo de FinGo</Text>

        <Text style={styles.adviceText}>
          {savingsRate >= 50
            ? 'Excelente trabajo. Estás ahorrando una parte importante de tus ingresos.'
            : savingsRate >= 20
            ? 'Vas bien. Intenta mantener tus gastos controlados para mejorar tu ahorro.'
            : savingsRate > 0
            ? 'Tu ahorro es bajo. Revisa tus gastos variables y reduce consumos innecesarios.'
            : 'Tus gastos están superando o igualando tus ingresos. Debes controlar tus egresos cuanto antes.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },
  backText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 14,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
    marginBottom: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  adviceCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 22,
    padding: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 14,
  },
  item: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 10,
  },
  adviceText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '700',
    lineHeight: 23,
  },
});