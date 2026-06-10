import { getCurrentUser, User } from '@/data/auth';
import { loadGoals, updateGoal } from '@/data/goals';


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
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const officialExpenseCategories = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Entretenimiento',
  'Servicios',
  'Restaurantes',
  'Salud',
  'Trabajo',
  'Ahorro',
  'Otros',
];

const officialIncomeCategories = [
  'Salario',
  'Freelance',
  'Negocio',
  'Inversiones',
  'Bonos',
  'Ventas',
  'Regalos',
  'Otros',
];

function normalizeCategory(type: Transaction['type'], category: string) {
  const cleanCategory = category.trim();

  if (type === 'expense') {
    return officialExpenseCategories.includes(cleanCategory)
      ? cleanCategory
      : 'Otros';
  }

  return officialIncomeCategories.includes(cleanCategory)
    ? cleanCategory
    : 'Otros';
}

function getCategoryIcon(type: Transaction['type'], category: string) {
  const normalizedCategory = normalizeCategory(type, category);

  const expenseIcons: Record<string, string> = {
    Alimentación: '🍔',
    Transporte: '🚗',
    Vivienda: '🏠',
    Entretenimiento: '🎮',
    Servicios: '📄',
    Restaurantes: '🍽️',
    Salud: '❤️',
    Trabajo: '💼',
    Ahorro: '🎯',
    Otros: '📦',
  };

  const incomeIcons: Record<string, string> = {
    Salario: '💼',
    Freelance: '💻',
    Negocio: '🏪',
    Inversiones: '📈',
    Bonos: '🎁',
    Ventas: '🛒',
    Regalos: '🎉',
    Otros: '📦',
  };

  return type === 'expense'
    ? expenseIcons[normalizedCategory]
    : incomeIcons[normalizedCategory];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  
  const [selectedFilter, setSelectedFilter] = useState<
  'all' | 'income' | 'expense' | 'saving'
 >('all');
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        const savedTransactions = await loadTransactions();
        setTransactionList(savedTransactions || []);
        setIsLoading(false);
      }

      loadData();
    }, [])
  );

  async function handleDeleteTransaction(transaction: Transaction) {
    Alert.alert(
       'Eliminar movimiento',
       '¿Estás seguro de que deseas eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (
              transaction.type === 'expense' &&
              transaction.category === 'Ahorro' &&
              transaction.goalId
            ) {
              const currentGoals = await loadGoals();
              const relatedGoal = currentGoals.find(
                (goal) => goal.id === transaction.goalId
              );

              if (relatedGoal) {
                await updateGoal({
                  ...relatedGoal,
                  currentAmount: Math.max(
                    relatedGoal.currentAmount - transaction.amount,
                    0
                  ),
               });
             }
          }

          const updatedTransactions = await deleteTransaction(transaction.id);
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
  const filteredTransactions = latestTransactions.filter((item) => {
   if (selectedFilter === 'all') return true;

   if (selectedFilter === 'income') {
    return item.type === 'income';
   }

   if (selectedFilter === 'saving') {
     return (item.type === 'expense' && item.category === 'Ahorro');
   }

    return (
    item.type === 'expense' &&
    item.category !== 'Ahorro'
    );
  });

  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const currentDate = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.greeting}>Cargando FinGo...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>FinGo</Text>
          <Text style={styles.greeting}>
            Hola, {user?.name?.split(' ')[0] || 'Usuario'} 👋
          </Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        <Link href="/profile" asChild>
          <Pressable style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
       </Link>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>

        <View style={styles.balanceFooter}>
          <Text style={styles.balanceFooterText}>
            Tasa de ahorro: {savingsRate.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>📈</Text>
          <Text style={styles.summaryTitle}>Ingresos</Text>
          <Text style={styles.income}>+${totalIncome.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>📉</Text>
          <Text style={styles.summaryTitle}>Gastos</Text>
          <Text style={styles.expense}>-${totalExpense.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Link href="/add-income" asChild>
          <Pressable style={styles.incomeButton}>
            <Text style={styles.buttonIcon}>➕</Text>
            <Text style={styles.buttonText}>Ingreso</Text>
          </Pressable>
        </Link>

        <Link href="/add-expense" asChild>
          <Pressable style={styles.expenseButton}>
            <Text style={styles.buttonIcon}>➖</Text>
            <Text style={styles.buttonText}>Gasto</Text>
          </Pressable>
        </Link>
      </View>

      <Link href="/statistics" asChild>
        <Pressable style={styles.statisticsButton}>
          <Text style={styles.buttonText}>Ver Estadísticas 📊</Text>
        </Pressable>
      </Link>

      <Link href="/goals" asChild>
         <Pressable style={styles.goalsButton}>
           <Text style={styles.buttonText}>Ver Metas 🎯</Text>
         </Pressable>
      </Link>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
        <Text style={styles.movementCount}>{latestTransactions.length} registros</Text>
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter('all')}
         >
          <Text style={styles.filterText}>Todos</Text>
       </Pressable>

       <Pressable
         style={[
           styles.filterButton,
           selectedFilter === 'income' && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter('income')}
         >
          <Text style={styles.filterText}>Ingresos</Text>
       </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            selectedFilter === 'expense' && styles.activeFilter,
          ]} 
          onPress={() => setSelectedFilter('expense')}
         >
          <Text style={styles.filterText}>Gastos</Text>
       </Pressable>

       <Pressable
         style={[
           styles.filterButton,
           selectedFilter === 'saving' && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter('saving')}
         >
          <Text style={styles.filterText}>Ahorro</Text>
       </Pressable>
      </View>

      {latestTransactions.length === 0 ? (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyTitle}>Aún no hay movimientos</Text>
    <Text style={styles.emptyText}>
      Registra tu primer ingreso o gasto para empezar a controlar tus finanzas.
    </Text>
  </View>
) : (
  filteredTransactions.map((item) => {
    const normalizedCategory = normalizeCategory(item.type, item.category);
    const categoryIcon = getCategoryIcon(item.type, item.category);
    const isIncome = item.type === 'income';

    return (
      <View key={item.id} style={styles.movementCard}>
        <View style={styles.movementHeader}>
          <View style={styles.movementIconBox}>
            <Text style={styles.movementIcon}>{categoryIcon}</Text>
          </View>

          <View style={styles.movementInfo}>
            <Text style={styles.movementDescription}>{item.description}</Text>
            <Text style={styles.categoryText}>
              {normalizedCategory} · {formatDate(item.date)}
            </Text>
          </View>

          <Text style={isIncome ? styles.incomeAmount : styles.expenseAmount}>
            {isIncome ? '+' : '-'}${item.amount.toFixed(2)}
          </Text>
        </View>

        {!item.locked ? (
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/edit-transaction',
                  params: { id: String(item.id) },
                })
              }
            >
              <Text style={styles.editText}>Editar</Text>
            </Pressable>

            <Pressable onPress={() => handleDeleteTransaction(item)}>
              <Text style={styles.deleteText}>Eliminar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actionsContainer}>
            <Text style={styles.lockedText}>
              🔒 Movimiento automático de meta
            </Text>
          </View>
        )}
      </View>
    );
  })
 )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 35,
  },
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 6,
  },
  greeting: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  dateText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  balanceCard: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },
  balanceLabel: {
    color: '#DBEAFE',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: 'bold',
    marginTop: 10,
  },
  balanceFooter: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 10,
    borderRadius: 14,
    marginTop: 18,
  },
  balanceFooterText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 18,
    elevation: 2,
  },
  summaryIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  summaryTitle: {
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  incomeButton: {
    width: '48%',
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  expenseButton: {
    width: '48%',
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statisticsButton: {
   backgroundColor: '#0F172A',
   padding: 17,
   borderRadius: 16,
   alignItems: 'center',
   marginBottom: 12,
  },

  goalsButton: {
   backgroundColor: '#10B981',
   padding: 17,
   borderRadius: 16,
   alignItems: 'center',
   marginBottom: 25,
  },

  buttonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  movementCount: {
    color: '#64748B',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
  },
  movementCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    elevation: 1,
  },
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  movementIcon: {
    fontSize: 22,
  },
  movementInfo: {
    flex: 1,
    marginRight: 10,
  },
  movementDescription: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },
  incomeAmount: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: 'bold',
  },
  expenseAmount: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 14,
  },
  editText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  lockedText: {
  color: '#64748B',
  fontWeight: '600',
  fontSize: 12,
},
  filterContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 14,
},

filterButton: {
  backgroundColor: '#E2E8F0',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 12,
},

activeFilter: {
  backgroundColor: '#2563EB',
},

filterText: {
  color: '#1E293B',
  fontWeight: 'bold',
},
  profileButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 2,
},

profileIcon: {
  fontSize: 20,
},
});