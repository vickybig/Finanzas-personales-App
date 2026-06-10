import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addGoal,
  deleteGoal,
  getDaysRemaining,
  getGoalProgress,
  getGoalStatusText,
  Goal,
  loadGoals,
  updateGoal,
} from '@/data/goals';

import {
  addTransaction,
  getBalance,
  loadTransactions,
  Transaction,
} from '@/data/transactions';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function GoalsScreen() {
  const router = useRouter();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [savingAmount, setSavingAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const savedGoals = await loadGoals();
        const savedTransactions = await loadTransactions();

        setGoals(savedGoals);
        setAvailableBalance(getBalance(savedTransactions));
      }

      loadData();
    }, [])
  );

  function resetForm() {
    setTitle('');
    setTargetAmount('');
    setTargetDate('');
  }

  async function handleAddGoal() {
    const cleanTitle = title.trim();
    const numericTarget = Number(targetAmount.trim().replace(',', '.'));

    if (!cleanTitle || !targetAmount || !targetDate) {
      Alert.alert('Campos incompletos', 'Completa el nombre, monto objetivo y fecha límite.');
      return;
    }

    if (isNaN(numericTarget) || numericTarget <= 0) {
      Alert.alert('Monto inválido', 'El objetivo debe ser mayor a 0.');
      return;
    }

    try {
      const updatedGoals = await addGoal({
        id: Date.now(),
        title: cleanTitle,
        targetAmount: numericTarget,
        currentAmount: 0,
        createdAt: new Date().toISOString(),
        targetDate: targetDate,
      });

      setGoals(updatedGoals);
      resetForm();
      Alert.alert('Meta creada 🎯', 'Tu meta fue registrada correctamente.');
    } catch {
      Alert.alert('Límite alcanzado', 'Solo puedes registrar hasta 3 metas.');
    }
  }

  function openSavingModal(goal: Goal) {
    setSelectedGoal(goal);
    setSavingAmount('');
    setModalVisible(true);
  }

  async function handleSaveProgress() {
    if (!selectedGoal) return;

    const amount = Number(savingAmount.trim().replace(',', '.'));

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a 0.');
      return;
    }

    if (amount > availableBalance) {
      Alert.alert(
        'Saldo insuficiente',
        `No puedes ahorrar $${amount.toFixed(2)} porque tu saldo disponible es $${availableBalance.toFixed(2)}.`
      );
      return;
    }

    const newAmount = selectedGoal.currentAmount + amount;

    if (newAmount > selectedGoal.targetAmount) {
      Alert.alert('Meta excedida', 'El ahorro no puede superar el objetivo.');
      return;
    }

    const goalTransaction: Transaction = {
      id: Date.now(),
      type: 'expense',
      amount,
      description: `Meta de ahorro - ${selectedGoal.title}`,
      category: 'Ahorro',
      date: new Date().toISOString(),
      goalId: selectedGoal.id,
      source: 'goal',
      locked: true,
    };

    await addTransaction(goalTransaction);

    const updatedGoals = await updateGoal({
      ...selectedGoal,
      currentAmount: newAmount,
    });

    const updatedTransactions = await loadTransactions();

    setGoals(updatedGoals);
    setAvailableBalance(getBalance(updatedTransactions));
    setModalVisible(false);
    setSelectedGoal(null);
    setSavingAmount('');

    Alert.alert(
      'Ahorro registrado 🎯',
      `Se descontaron $${amount.toFixed(2)} de tu saldo y se agregó al historial.`
    );
  }

  async function handleCompleteGoal(goal: Goal) {
    const amountToComplete = goal.targetAmount - goal.currentAmount;

    if (amountToComplete <= 0) {
      Alert.alert('Meta completada', 'Esta meta ya está completa.');
      return;
    }

    if (amountToComplete > availableBalance) {
      Alert.alert(
        'Saldo insuficiente',
        `Necesitas $${amountToComplete.toFixed(2)} para completar esta meta, pero tu saldo disponible es $${availableBalance.toFixed(2)}.`
      );
      return;
    }

    const goalTransaction: Transaction = {
      id: Date.now(),
      type: 'expense',
      amount: amountToComplete,
      description: `Meta de ahorro - ${goal.title}`,
      category: 'Ahorro',
      date: new Date().toISOString(),
      goalId: goal.id,
      source: 'goal',
      locked: true,
    };

    await addTransaction(goalTransaction);

    const updatedGoals = await updateGoal({
      ...goal,
      currentAmount: goal.targetAmount,
    });

    const updatedTransactions = await loadTransactions();

    setGoals(updatedGoals);
    setAvailableBalance(getBalance(updatedTransactions));

    Alert.alert('¡Meta completada! 🏆', `Completaste: ${goal.title}`);
  }

  async function handleDeleteGoal(goal: Goal) {
  Alert.alert(
    'Eliminar meta',
    `¿Seguro que deseas eliminar esta meta? Se devolverán $${goal.currentAmount.toFixed(2)} a tu saldo disponible.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (goal.currentAmount > 0) {

            const refundTransaction: Transaction = {
              id: Date.now(),
              type: 'income',
              amount: goal.currentAmount,
              description: `Devolución de meta - ${goal.title}`,
              category: 'Ahorro',
              date: new Date().toISOString(),
              goalId: goal.id,
              source: 'goal',
              locked: true,
            }; 
            
            await addTransaction(refundTransaction);
          }

          const updatedGoals = await deleteGoal(goal.id);
          const updatedTransactions = await loadTransactions();

          setGoals(updatedGoals);
          setAvailableBalance(getBalance(updatedTransactions));

          Alert.alert(
            'Meta eliminada',
            'El dinero ahorrado fue devuelto a tu saldo disponible.'
          );
        },
      },
    ]
  );
}

  const totalSaved = goals.reduce((total, goal) => total + goal.currentAmount, 0);
  const totalTarget = goals.reduce((total, goal) => total + goal.targetAmount, 0);
  const generalProgress =
    totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      <Text style={styles.appName}>FinGo</Text>
      <Text style={styles.title}>Mis Metas 🎯</Text>
      <Text style={styles.subtitle}>
        Organiza tus objetivos financieros. Cada ahorro se descuenta de tu saldo y aparece en el historial.
      </Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Ahorro total en metas</Text>
        <Text style={styles.heroAmount}>${totalSaved.toFixed(2)}</Text>

        <View style={styles.heroProgressBackground}>
          <View style={[styles.heroProgressFill, { width: `${generalProgress}%` }]} />
        </View>

        <Text style={styles.heroFooter}>
          Progreso general: {generalProgress.toFixed(1)}%
        </Text>

        <Text style={styles.heroFooter}>
          Saldo disponible: ${availableBalance.toFixed(2)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statLabel}>Metas</Text>
          <Text style={styles.statValue}>{goals.length}/3</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💵</Text>
          <Text style={styles.statLabel}>Objetivo total</Text>
          <Text style={styles.statValue}>${totalTarget.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Nueva meta</Text>
        <Text style={styles.label}>Nombre</Text>
        
        <TextInput 
          style={styles.input}
          placeholder="Ej: Moto, laptop, viaje"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Fecha objetivo</Text>

        <Pressable
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
         >
         <Text
          style={
            targetDate
              ? styles.dateSelected
              : styles.datePlaceholder
          }
         >
          {targetDate || '📅 Seleccionar fecha'}
         </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={targetDate ? new Date(targetDate) : new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);

              if (selectedDate) {
                const formattedDate =
                  selectedDate.toISOString().split('T')[0];

                setTargetDate(formattedDate);
              }
           }}
          />
        )}

        <Text style={styles.label}>Monto objetivo</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Ej: 500"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <Text style={styles.helperText}>
          Las metas empiezan en $0. Luego puedes agregar ahorro desde tu saldo disponible.
        </Text>

        <Pressable
          style={[
            styles.primaryButton,
            goals.length >= 3 && styles.disabledButton,
          ]}
          onPress={handleAddGoal}
          disabled={goals.length >= 3}
        >
          <Text style={styles.primaryButtonText}>
            {goals.length >= 3 ? 'Límite de metas alcanzado' : 'Crear meta'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lista de metas</Text>
        <Text style={styles.counter}>{goals.length} registros</Text>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📌</Text>
          <Text style={styles.emptyTitle}>Aún no tienes metas</Text>
          <Text style={styles.emptyText}>
            Crea una meta para empezar a planificar tu ahorro.
          </Text>
        </View>
      ) : (
        goals.map((goal) => {
          const progress = getGoalProgress(goal);
          const missingAmount = goal.targetAmount - goal.currentAmount;
          const isCompleted = progress >= 100;
          const daysRemaining = getDaysRemaining(goal);
          const statusText = getGoalStatusText(goal);

          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalIconBox}>
                  <Text style={styles.goalIcon}>{isCompleted ? '🏆' : '🎯'}</Text>
                </View>

                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalSubtitle}>
                    ${goal.currentAmount.toFixed(2)} de ${goal.targetAmount.toFixed(2)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.goalPercent,
                    isCompleted && styles.completedPercent,
                  ]}
                >
                  {progress.toFixed(0)}%
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    isCompleted && styles.completedFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>

              <Text style={styles.goalDate}>
               📅 Fecha objetivo: {goal.targetDate}
              </Text>

              <Text style={styles.goalStatus}>
               {statusText}
              </Text>

              {daysRemaining !== null && !isCompleted && (
              <Text style={styles.goalDays}>
               ⏳{daysRemaining} días restantes
              </Text>
             )}

              <Text style={styles.missingText}>
                {isCompleted
                  ? 'Meta completada ✅'
                  : `Faltan $${missingAmount.toFixed(2)} para cumplirla`}
              </Text>

              <View style={styles.actionsRow}>
                {!isCompleted && (
                  <>
                    <Pressable
                      style={styles.addButton}
                      onPress={() => openSavingModal(goal)}
                    >
                      <Text style={styles.addButtonText}>Agregar ahorro</Text>
                    </Pressable>

                    <Pressable
                      style={styles.completeButton}
                      onPress={() => handleCompleteGoal(goal)}
                    >
                      <Text style={styles.completeButtonText}>Completar</Text>
                    </Pressable>
                  </>
                )}

                <Pressable onPress={() => handleDeleteGoal(goal)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Agregar ahorro</Text>
            <Text style={styles.modalSubtitle}>
              {selectedGoal ? selectedGoal.title : ''}
            </Text>

            <Text style={styles.balanceText}>
              Saldo disponible: ${availableBalance.toFixed(2)}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ej: 20"
              keyboardType="numeric"
              value={savingAmount}
              onChangeText={setSavingAmount}
            />

            <Pressable style={styles.primaryButton} onPress={handleSaveProgress}>
              <Text style={styles.primaryButtonText}>Guardar avance</Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    fontSize: 34,
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
  heroCard: {
    backgroundColor: '#2563EB',
    borderRadius: 26,
    padding: 24,
    marginBottom: 18,
  },
  heroLabel: {
    color: '#DBEAFE',
    fontSize: 16,
    fontWeight: '700',
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 10,
  },
  heroProgressBackground: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    marginTop: 18,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
  },
  heroFooter: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 18,
    borderRadius: 20,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    color: '#64748B',
    fontWeight: '700',
  },
  statValue: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 19,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 25,
    elevation: 2,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  label: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 15,
    fontSize: 16,
    marginBottom: 14,
  },
  helperText: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  counter: {
    color: '#64748B',
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  goalSubtitle: {
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  goalPercent: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#10B981',
  },
  completedPercent: {
    color: '#F59E0B',
  },
  progressBackground: {
    height: 11,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 999,
  },
  completedFill: {
    backgroundColor: '#F59E0B',
  },
  missingText: {
    color: '#64748B',
    fontWeight: '700',
    marginTop: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 15,
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
  },
  completeButtonText: {
    color: '#D97706',
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalSubtitle: {
    color: '#64748B',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 10,
  },
  balanceText: {
    color: '#2563EB',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: 'bold',
  },

  goalDate: {
  marginTop: 10,
  color: '#475569',
  fontWeight: '600',
},

goalStatus: {
  marginTop: 6,
  fontWeight: 'bold',
  color: '#2563EB',
},

goalDays: {
  marginTop: 4,
  color: '#F59E0B',
  fontWeight: '600',
},
datePlaceholder: {
  color: '#94A3B8',
  fontSize: 16,
},

dateSelected: {
  color: '#0F172A',
  fontSize: 16,
  fontWeight: '600',
},
});