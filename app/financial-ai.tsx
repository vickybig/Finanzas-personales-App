import {
  getBalance,
  getTotalExpense,
  getTotalIncome,
  loadTransactions,
  Transaction,
} from '@/data/transactions';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type TopCategory = {
  name: string;
  amount: number;
  percentage: number;
};

function getFinancialStatus(savingsRate: number, balance: number) {
  if (balance < 0 || savingsRate <= 0) {
    return {
      label: '🔴 Riesgo financiero',
      message: 'Tus gastos están alcanzando o superando tus ingresos.',
    };
  }

  if (savingsRate >= 40) {
    return {
      label: '🟢 Excelente',
      message: 'Tienes una buena capacidad de ahorro.',
    };
  }

  if (savingsRate >= 20) {
    return {
      label: '🟡 Bueno',
      message: 'Tu situación es estable, pero aún puedes optimizar tus gastos.',
    };
  }

  return {
    label: '🟠 Atención',
    message: 'Tu ahorro es bajo. Revisa tus gastos variables.',
  };
}

function getTopExpenseCategory(transactions: Transaction[]): TopCategory | null {
  const expenses = transactions.filter(
    (item) => item.type === 'expense' && item.category !== 'Ahorro'
  );

  if (expenses.length === 0) return null;

  const totalExpenseWithoutSavings = expenses.reduce(
    (total, item) => total + item.amount,
    0
  );

  const categories: Record<string, number> = {};

  expenses.forEach((item) => {
    categories[item.category] = (categories[item.category] || 0) + item.amount;
  });

  const topCategoryName = Object.keys(categories).reduce((maxCategory, category) =>
    categories[category] > categories[maxCategory] ? category : maxCategory
  );

  const amount = categories[topCategoryName];

  return {
    name: topCategoryName,
    amount,
    percentage: totalExpenseWithoutSavings > 0 ? (amount / totalExpenseWithoutSavings) * 100 : 0,
  };
}

export default function FinancialAIScreen() {
  const router = useRouter();

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [topCategory, setTopCategory] = useState<TopCategory | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const transactions = await loadTransactions();

        setIncome(getTotalIncome(transactions));
        setExpense(getTotalExpense(transactions));
        setBalance(getBalance(transactions));
        setTopCategory(getTopExpenseCategory(transactions));
      }

      loadData();
    }, [])
  );

  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  const status = getFinancialStatus(savingsRate, balance);
  const possibleSaving = topCategory ? topCategory.amount * 0.1 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      <Text style={styles.appName}>FinGo</Text>
      <Text style={styles.title}>FinGo AI 🧠</Text>
      <Text style={styles.subtitle}>
        Análisis automático de tus ingresos, gastos, saldo y hábitos financieros.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Estado financiero</Text>
        <Text style={styles.statusTitle}>{status.label}</Text>
        <Text style={styles.statusMessage}>{status.message}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen inteligente</Text>
        <Text style={styles.item}>💰 Ingresos: ${income.toFixed(2)}</Text>
        <Text style={styles.item}>💸 Gastos: ${expense.toFixed(2)}</Text>
        <Text style={styles.item}>📊 Saldo: ${balance.toFixed(2)}</Text>
        <Text style={styles.item}>🏦 Tasa de ahorro: {savingsRate.toFixed(1)}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mayor categoría de gasto</Text>

        {topCategory ? (
          <>
            <Text style={styles.item}>📌 Categoría: {topCategory.name}</Text>
            <Text style={styles.item}>💸 Total gastado: ${topCategory.amount.toFixed(2)}</Text>
            <Text style={styles.item}>
              📊 Representa el {topCategory.percentage.toFixed(1)}% de tus gastos variables
            </Text>
          </>
        ) : (
          <Text style={styles.item}>
            Todavía no tienes gastos suficientes para analizar categorías.
          </Text>
        )}
      </View>

      <View style={styles.adviceCard}>
        <Text style={styles.cardTitle}>Recomendación personalizada</Text>
        <Text style={styles.adviceText}>
          {topCategory
            ? `Tu mayor gasto está en ${topCategory.name}. Si reduces solo un 10% en esta categoría, podrías ahorrar aproximadamente $${possibleSaving.toFixed(2)} adicionales.`
            : savingsRate >= 20
            ? 'Vas bien. Mantén tus gastos controlados y sigue registrando tus movimientos.'
            : 'Empieza registrando tus gastos principales para que FinGo AI pueda darte recomendaciones más precisas.'}
        </Text>
      </View>

      <Pressable
        style={styles.reportButton}
        onPress={() =>
        router.push({
          pathname: '/financial-report',
        })
      }
     >
        <Text style={styles.reportButtonText}>Ver Reporte Financiero 📄</Text>
      </Pressable>
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 14,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
    lineHeight: 22,
  },
  item: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 22,
  },
  adviceText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '700',
    lineHeight: 23,
  },
  reportButton: {
    backgroundColor: '#0F172A',
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});