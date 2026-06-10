import {
  getBalance,
  getTotalExpense,
  getTotalIncome,
  loadTransactions,
  Transaction,
} from '@/data/transactions';
import * as Print from 'expo-print';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type TopCategory = {
  name: string;
  amount: number;
  percentage: number;
};

function getFinancialStatus(savingsRate: number, balance: number) {
  if (balance < 0 || savingsRate <= 0) return '🔴 Riesgo financiero';
  if (savingsRate >= 40) return '🟢 Excelente';
  if (savingsRate >= 20) return '🟡 Bueno';
  return '🟠 Atención';
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

export default function FinancialReportScreen() {
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

  const currentDate = new Date().toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const recommendation = topCategory
    ? `Reducir un 10% en ${topCategory.name} permitiría ahorrar aproximadamente $${possibleSaving.toFixed(2)} adicionales.`
    : 'Registra más movimientos para obtener una recomendación más precisa.';

  async function handleExportPDF() {
    try {
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 32px;
                color: #1E293B;
                background-color: #FFFFFF;
              }
              .header {
                background-color: #2563EB;
                color: white;
                padding: 24px;
                border-radius: 16px;
                margin-bottom: 24px;
              }
              .brand {
                font-size: 18px;
                font-weight: bold;
                color: #D1FAE5;
                margin-bottom: 8px;
              }
              h1 {
                margin: 0;
                font-size: 28px;
              }
              .date {
                margin-top: 10px;
                font-size: 14px;
                color: #DBEAFE;
              }
              .section {
                border: 1px solid #E2E8F0;
                border-radius: 14px;
                padding: 18px;
                margin-bottom: 16px;
              }
              h2 {
                font-size: 20px;
                margin-top: 0;
                color: #0F172A;
              }
              p {
                font-size: 15px;
                line-height: 1.5;
                margin: 7px 0;
              }
              .recommendation {
                background-color: #EFF6FF;
                border-radius: 14px;
                padding: 18px;
                color: #1E40AF;
                font-weight: bold;
              }
              .footer {
                margin-top: 28px;
                font-size: 12px;
                color: #64748B;
                text-align: center;
              }
            </style>
          </head>

          <body>
            <div class="header">
              <div class="brand">FinGo</div>
              <h1>Reporte Financiero</h1>
              <div class="date">Fecha: ${currentDate}</div>
            </div>

            <div class="section">
              <h2>Estado financiero</h2>
              <p><strong>${status}</strong></p>
            </div>

            <div class="section">
              <h2>Resumen financiero</h2>
              <p><strong>Ingresos:</strong> $${income.toFixed(2)}</p>
              <p><strong>Gastos:</strong> $${expense.toFixed(2)}</p>
              <p><strong>Saldo disponible:</strong> $${balance.toFixed(2)}</p>
              <p><strong>Tasa de ahorro:</strong> ${savingsRate.toFixed(1)}%</p>
            </div>

            <div class="section">
              <h2>Mayor gasto variable</h2>
              ${
                topCategory
                  ? `
                    <p><strong>Categoría:</strong> ${topCategory.name}</p>
                    <p><strong>Total gastado:</strong> $${topCategory.amount.toFixed(2)}</p>
                    <p><strong>Participación:</strong> ${topCategory.percentage.toFixed(1)}%</p>
                  `
                  : '<p>No existen gastos variables suficientes para analizar.</p>'
              }
            </div>

            <div class="recommendation">
              <h2>Recomendación</h2>
              <p>${recommendation}</p>
            </div>

            <div class="footer">
              Reporte generado automáticamente por FinGo AI.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('PDF generado', `Archivo guardado en: ${uri}`);
      }
    } catch {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      <Text style={styles.appName}>FinGo</Text>
      <Text style={styles.title}>Reporte Financiero 📄</Text>
      <Text style={styles.subtitle}>
        Informe generado automáticamente con base en tus movimientos registrados.
      </Text>

      <View style={styles.reportCard}>
        <Text style={styles.reportHeader}>FINGO - REPORTE FINANCIERO</Text>
        <Text style={styles.reportDate}>Fecha: {currentDate}</Text>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Estado financiero</Text>
        <Text style={styles.reportText}>{status}</Text>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Resumen</Text>
        <Text style={styles.reportText}>Ingresos: ${income.toFixed(2)}</Text>
        <Text style={styles.reportText}>Gastos: ${expense.toFixed(2)}</Text>
        <Text style={styles.reportText}>Saldo disponible: ${balance.toFixed(2)}</Text>
        <Text style={styles.reportText}>Tasa de ahorro: {savingsRate.toFixed(1)}%</Text>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Mayor gasto variable</Text>
        {topCategory ? (
          <>
            <Text style={styles.reportText}>Categoría: {topCategory.name}</Text>
            <Text style={styles.reportText}>Total: ${topCategory.amount.toFixed(2)}</Text>
            <Text style={styles.reportText}>
              Participación: {topCategory.percentage.toFixed(1)}%
            </Text>
          </>
        ) : (
          <Text style={styles.reportText}>
            No existen gastos variables suficientes para analizar.
          </Text>
        )}

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Recomendación</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>

      <Pressable style={styles.pdfButton} onPress={handleExportPDF}>
        <Text style={styles.pdfButtonText}>Exportar PDF 📄</Text>
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
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  reportHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  reportDate: {
    color: '#64748B',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  reportText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 7,
    lineHeight: 22,
  },
  recommendationText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '700',
    lineHeight: 23,
  },
  pdfButton: {
    backgroundColor: '#0F172A',
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});