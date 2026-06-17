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
  const [filterType, setFilterType] = useState<
    'all' | 'week' | 'month' | 'year'
  >('year');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

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
  const accumulatedIncome = Array(12).fill(0);
  const accumulatedExpense = Array(12).fill(0);
  const expensesByCategory: Record<string, number> = {};
  const expensesBySelectedCategory = Array(12).fill(0);

  const expenseCategories = officialExpenseCategories;
  const activeCategory = selectedCategory || expenseCategories[0];
  const now = new Date();

   const filteredTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    switch (filterType) {
      
      case 'week': {
        const last7Days = new Date();
        last7Days.setDate(now.getDate() - 7);

        return date >= last7Days && date <= now;
      }

      case 'month':
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === now.getFullYear()
        );

      case 'year':
        return date.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  });

  filteredTransactions.forEach((transaction) => {
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

  let runningIncome = 0;
  let runningExpense = 0;

  for (let i = 0; i < 12; i++) {
    runningIncome += monthlyIncome[i];
    runningExpense += monthlyExpense[i];

    accumulatedIncome[i] = runningIncome;
    accumulatedExpense[i] = runningExpense;
  }

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

      <Text style={styles.title}>
        {filterType === 'month'
          ? `${months[selectedMonth]} ${currentYear} 📊`
          : 'Estadísticas 📊'}
      </Text>

      <Pressable style={styles.pdfButton} onPress={handleExportPdf}>
        <Text style={styles.pdfButtonText}>Exportar PDF 📄</Text>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 20,
          gap: 8,
        }}
      >
        {[
          { label: 'Todo', value: 'all' },
          { label: 'Semana', value: 'week' },
          { label: 'Mes', value: 'month' },
          { label: 'Año', value: 'year' },
        ].map((item) => (
          <Pressable
            key={item.value}
            style={{
              backgroundColor:
                filterType === item.value ? '#10B981' : '#E2E8F0',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
            }}
            onPress={() => setFilterType(item.value as any)}
          >
            <Text
              style={{
                color: filterType === item.value ? '#FFF' : '#334155',
                fontWeight: '600',
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filterType === 'month' && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 12,
            marginBottom: 20,
            elevation: 2,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#334155',
              marginBottom: 10,
            }}
          >
            Selecciona un mes
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >

          {months.map((month, index) => (
            <Pressable
              key={month}
              style={{
                backgroundColor:
                  selectedMonth === index ? '#2563EB' : '#E2E8F0',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
              }}
              onPress={() => setSelectedMonth(index)}
            >
              <Text
                style={{
                  color: selectedMonth === index ? '#FFF' : '#334155',
                  fontWeight: '600',
                }}
              >
                {month}
              </Text>
            </Pressable>
          ))}
        </View>
        </View>
      )}

      <View style={styles.summaryContainer}>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ingresos</Text>
          <Text style={styles.income}>${totalIncome.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Gastos</Text>
          <Text style={styles.expense}>${totalExpense.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Ahorro estimado</Text>
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
          {activeCategory}: ${totalSelectedCategory.toFixed(2)}
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
        <Text style={styles.chartTitle}>
          Ingresos vs Gastos Acumulados
        </Text>

        <LineChart
          data={{
            labels: months,
            datasets: [
              {
                data: accumulatedIncome,
                color: (opacity = 1) =>
                  `rgba(22, 163, 74, ${opacity})`,
              },
              {
                data: accumulatedExpense,
                color: (opacity = 1) =>
                  `rgba(220, 38, 38, ${opacity})`,
              },
            ],
            legend: ['Ingresos Acumulados', 'Gastos Acumulados'],
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