import { loadTransactions, Transaction } from '@/data/transactions';
import { generateFinancialReportPdf } from '@/data/pdf-report';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const months = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const officialExpenseCategories = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Entretenimiento',
  'Servicios',
  'Restaurantes',
  'Salud',
  'Trabajo',
  'Otros',
];

const categoryColors = [
  '#16A34A',
  '#2563EB',
  '#7C3AED',
  '#F97316',
  '#DC2626',
  '#DB2777',
  '#0891B2',
  '#CA8A04',
  '#64748B',
];

function normalizeExpenseCategory(category: string) {
  const cleanCategory = category.trim();

  if (officialExpenseCategories.includes(cleanCategory)) {
    return cleanCategory;
  }

  return 'Otros';
}

export default function StatisticsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const savedTransactions = await loadTransactions();
        setTransactions(savedTransactions);
      }

      loadData();
    }, [])
  );

  async function handleExportPdf() {
      try {
        await generateFinancialReportPdf();
      } catch {
        Alert.alert(
        'Error al generar PDF',
          'No se pudo crear el reporte financiero. Intenta nuevamente.'
        );
      }
    }

  const currentYear = new Date().getFullYear();
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);
  const expensesByCategory: Record<string, number> = {};
  const expensesBySelectedCategory = Array(12).fill(0);

  const expenseCategories = officialExpenseCategories;
  const activeCategory = selectedCategory || expenseCategories[0];

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);

    if (transactionDate.getFullYear() === currentYear) {
      const monthIndex = transactionDate.getMonth();

      if (transaction.type === 'income') {
        monthlyIncome[monthIndex] += transaction.amount;
      } else {
        const normalizedCategory = normalizeExpenseCategory(transaction.category);

        monthlyExpense[monthIndex] += transaction.amount;

        expensesByCategory[normalizedCategory] =
          (expensesByCategory[normalizedCategory] || 0) + transaction.amount;

        if (normalizedCategory === activeCategory) {
          expensesBySelectedCategory[monthIndex] += transaction.amount;
        }
      }
    }
  });

  const totalIncome = monthlyIncome.reduce((total, item) => total + item, 0);
  const totalExpense = monthlyExpense.reduce((total, item) => total + item, 0);
  const totalSelectedCategory = expensesBySelectedCategory.reduce(
    (total, item) => total + item,
    0
  );
  const balance = totalIncome - totalExpense;

  const categoryData = expenseCategories
    .map((category, index) => ({
      name: category,
      amount: expensesByCategory[category] || 0,
      color: categoryColors[index % categoryColors.length],
      legendFontColor: '#1E293B',
      legendFontSize: 13,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

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
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>
      <Text style={styles.title}>Estadísticas 📊</Text>
      <Pressable style={styles.pdfButton} onPress={handleExportPdf}>
        <Text style={styles.pdfButtonText}>Exportar PDF 📄</Text>
      </Pressable>

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

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Ahorro estimado del año</Text>
        <Text
          style={[
            styles.balanceAmount,
            balance >= 0 ? styles.balancePositive : styles.balanceNegative,
          ]}
        >
          ${balance.toFixed(2)}
        </Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Gastos por categoría</Text>

        {categoryData.length === 0 ? (
          <Text style={styles.emptyText}>
            Aún no hay gastos registrados para mostrar.
          </Text>
        ) : (
          <>
            <PieChart
              data={categoryData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="60"
              absolute
              hasLegend={false}
            />

            <View style={styles.categoryList}>
              {categoryData.map((item) => {
                const percentage =
                  totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;

                return (
                  <View key={item.name} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={styles.categoryName}>{item.name}</Text>
                    </View>

                    <Text style={styles.categoryAmount}>
                      ${item.amount.toFixed(2)} · {percentage.toFixed(1)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Histórico por categoría</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryButtonsContainer}
        >
          {expenseCategories.map((category) => {
            const isSelected = category === activeCategory;

            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  isSelected && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    isSelected && styles.categoryButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.selectedCategoryText}>
          {activeCategory}: ${totalSelectedCategory.toFixed(2)} en el año
        </Text>

        <BarChart
          data={{
            labels: months,
            datasets: [
              {
                data: expensesBySelectedCategory,
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
             color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
          },
          {
            data: monthlyExpense,
            color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
          },
        ],
        legend: ['🟢 Ingresos', '🔴 Gastos'],
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
    marginBottom: 14,
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
  balanceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 15,
    elevation: 2,
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#64748B',
    marginBottom: 8,
  },
  balanceAmount: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  balancePositive: {
    color: '#16A34A',
  },
  balanceNegative: {
    color: '#DC2626',
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
  categoryList: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryAmount: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
  },
  categoryButtonText: {
    color: '#334155',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  selectedCategoryText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  pdfButton: {
  backgroundColor: '#2563EB',
  padding: 16,
  borderRadius: 16,
  alignItems: 'center',
  marginBottom: 18,
},

pdfButtonText: {
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: 16,
},

backText: {
  color: '#2563EB',
  fontWeight: 'bold',
  fontSize: 16,
  marginBottom: 14,
},
});