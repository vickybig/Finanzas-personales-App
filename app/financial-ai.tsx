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

type FinancialStatus = {
  level: 'Excelente' | 'Bueno' | 'Atención' | 'Riesgo';
  icon: string;
  message: string;
  background: string;
  color: string;
  note: string;
};

function getFinancialStatus(savingsRate: number, balance: number): FinancialStatus {
  if (balance < 0 || savingsRate <= 0) {
    return {
      level: 'Riesgo',
      icon: '🔴',
      message: 'Tus gastos están alcanzando o superando tus ingresos.',
      background: '#FEE2E2',
      color: '#DC2626',
      note: 'Tu situación financiera requiere atención urgente.',
    };
  }

  if (savingsRate >= 40) {
    return {
      level: 'Excelente',
      icon: '🟢',
      message: 'Tienes una buena capacidad de ahorro.',
      background: '#DCFCE7',
      color: '#16A34A',
      note: 'Tu situación está en un nivel óptimo.',
    };
  }

  if (savingsRate >= 20) {
    return {
      level: 'Bueno',
      icon: '🟡',
      message: 'Tu situación es estable, pero aún puedes optimizar tus gastos.',
      background: '#FEF9C3',
      color: '#CA8A04',
      note: 'Tienes áreas de mejora para crecer más.',
    };
  }

  return {
    level: 'Atención',
    icon: '🟠',
    message: 'Tu ahorro es bajo. Revisa tus gastos variables.',
    background: '#FFEDD5',
    color: '#EA580C',
    note: 'Tus gastos pueden estar afectando tu ahorro.',
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
    percentage:
      totalExpenseWithoutSavings > 0
        ? (amount / totalExpenseWithoutSavings) * 100
        : 0,
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
  const topCategoryProgress = Math.min(topCategory?.percentage || 0, 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      <Text style={styles.appName}>FinGo</Text>
      <Text style={styles.title}>FinGo Avanzado ⭐</Text>
      <Text style={styles.subtitle}>
        Análisis automático de tus ingresos, gastos, saldo y hábitos financieros.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Estado financiero</Text>

        <View style={[styles.statusBox, { backgroundColor: status.background }]}>
          <View style={styles.statusIconCircle}>
            <Text style={styles.statusIcon}>{status.icon}</Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={[styles.statusLevel, { color: status.color }]}>
              {status.level}
            </Text>
            <Text style={styles.statusMessage}>{status.message}</Text>
          </View>
        </View>

        <View style={styles.levelBar}>
          <View style={[styles.levelSegment, { backgroundColor: '#DC2626' }]} />
          <View style={[styles.levelSegment, { backgroundColor: '#EA580C' }]} />
          <View style={[styles.levelSegment, { backgroundColor: '#FACC15' }]} />
          <View style={[styles.levelSegment, { backgroundColor: '#16A34A' }]} />
        </View>

        <View style={[styles.statusNote, { backgroundColor: status.background }]}>
          <Text style={[styles.statusNoteText, { color: status.color }]}>
            {status.note}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen inteligente</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>💰 Ingresos</Text>
          <Text style={styles.incomeText}>${income.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>💸 Gastos</Text>
          <Text style={styles.expenseText}>${expense.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>📊 Saldo</Text>
          <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>🏦 Tasa de ahorro</Text>
          <Text style={styles.rateText}>{savingsRate.toFixed(1)}%</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mayor categoría de gasto</Text>

        {topCategory ? (
          <>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryIconBox}>
                <Text style={styles.categoryIcon}>📌</Text>
              </View>

              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: status.color }]}>
                  {topCategory.name}
                </Text>
                <Text style={styles.categoryDetail}>
                  ${topCategory.amount.toFixed(2)} gastados
                </Text>
                <Text style={styles.categoryDetail}>
                  Representa el {topCategory.percentage.toFixed(1)}% de tus gastos variables
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${topCategoryProgress}%`,
                    backgroundColor: status.color,
                  },
                ]}
              />
            </View>
          </>
        ) : (
          <Text style={styles.item}>
            Todavía no tienes gastos suficientes para analizar categorías.
          </Text>
        )}
      </View>

      <View style={[styles.adviceCard, { backgroundColor: status.background }]}>
        <Text style={styles.cardTitle}>Recomendación personalizada</Text>

        <View style={styles.adviceRow}>
          <View style={styles.adviceIconBox}>
            <Text style={styles.adviceIcon}>🚀</Text>
          </View>

          <Text style={[styles.adviceText, { color: status.color }]}>
            {topCategory
              ? `Tu mayor gasto está en ${topCategory.name}. Si reduces solo un 10%, podrías ahorrar aproximadamente $${possibleSaving.toFixed(2)} adicionales.`
              : savingsRate >= 20
              ? 'Vas bien. Mantén tus gastos controlados y sigue registrando tus movimientos.'
              : 'Empieza registrando tus gastos principales para que FinGo AI pueda darte recomendaciones más precisas.'}
          </Text>
        </View>
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
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  statusBox: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusIcon: {
    fontSize: 30,
  },
  statusContent: {
    flex: 1,
  },
  statusLevel: {
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
    lineHeight: 21,
  },
  levelBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  levelSegment: {
    flex: 1,
    height: 7,
    borderRadius: 10,
  },
  statusNote: {
    padding: 12,
    borderRadius: 14,
  },
  statusNoteText: {
    fontWeight: '800',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  adviceCard: {
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '700',
  },
  incomeText: {
    color: '#16A34A',
    fontWeight: '900',
    fontSize: 16,
  },
  expenseText: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 16,
  },
  balanceText: {
    color: '#2563EB',
    fontWeight: '900',
    fontSize: 16,
  },
  rateText: {
    color: '#7C3AED',
    fontWeight: '900',
    fontSize: 16,
  },
  item: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 22,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  categoryIcon: {
    fontSize: 27,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  categoryDetail: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    lineHeight: 20,
  },
  progressTrack: {
    height: 9,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 20,
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adviceIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  adviceIcon: {
    fontSize: 26,
  },
  adviceText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
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