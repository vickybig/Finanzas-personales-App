import { loadTransactions, Transaction } from '@/data/transactions';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function StatisticsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const savedTransactions = await loadTransactions();
        setTransactions(savedTransactions);
      }

      loadData();
    }, [])
  );

  const currentYear = new Date().getFullYear();
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);

    if (transactionDate.getFullYear() === currentYear) {
      const monthIndex = transactionDate.getMonth();

      if (transaction.type === 'income') {
        monthlyIncome[monthIndex] += transaction.amount;
      } else {
        monthlyExpense[monthIndex] += transaction.amount;
      }
    }
  });

  const totalIncome = monthlyIncome.reduce((total, item) => total + item, 0);
  const totalExpense = monthlyExpense.reduce((total, item) => total + item, 0);

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    barPercentage: 0.6,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estadísticas 📊</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ingresos del año</Text>
          <Text style={styles.income}>${totalIncome.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Gastos del año</Text>
          <Text style={styles.expense}>${totalExpense.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Histórico mensual de gastos</Text>

        <BarChart
          data={{
            labels: months,
            datasets: [
              {
                data: monthlyExpense,
              },
            ],
          }}
          width={screenWidth - 40}
          height={260}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Ingresos vs Gastos</Text>

        <LineChart
          data={{
            labels: months,
            datasets: [
              {
                data: monthlyIncome,
              },
              {
                data: monthlyExpense,
              },
            ],
            legend: ['Ingresos', 'Gastos'],
          }}
          width={screenWidth - 40}
          height={260}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={chartConfig}
          bezier
          fromZero
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
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
  summaryLabel: {
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
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    marginLeft: 16,
  },
});