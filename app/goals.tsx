import {
  addGoal,
  deleteGoal,
  getGoalProgress,
  Goal,
  loadGoals,
  updateGoal,
} from '@/data/goals';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const savedGoals = await loadGoals();
        setGoals(savedGoals);
      }

      loadData();
    }, [])
  );

  async function handleAddGoal() {
    const cleanTitle = title.trim();
    const numericTarget = Number(targetAmount.trim().replace(',', '.'));
    const numericCurrent = Number(currentAmount.trim().replace(',', '.'));

    if (!cleanTitle || !targetAmount || !currentAmount) {
      Alert.alert('Campos incompletos', 'Completa todos los campos de la meta.');
      return;
    }

    if (isNaN(numericTarget) || numericTarget <= 0) {
      Alert.alert('Monto objetivo inválido', 'Ingresa un objetivo mayor a 0.');
      return;
    }

    if (isNaN(numericCurrent) || numericCurrent < 0) {
      Alert.alert('Monto ahorrado inválido', 'Ingresa un monto válido.');
      return;
    }

    if (numericCurrent > numericTarget) {
      Alert.alert(
        'Revisa los montos',
        'El monto ahorrado no puede ser mayor al monto objetivo.'
      );
      return;
    }

    try {
      const updatedGoals = await addGoal({
        id: Date.now(),
        title: cleanTitle,
        targetAmount: numericTarget,
        currentAmount: numericCurrent,
        createdAt: new Date().toISOString(),
      });

      setGoals(updatedGoals);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');

      Alert.alert('Meta creada', 'Tu meta de ahorro se registró correctamente.');
    } catch (error) {
      Alert.alert('Límite de metas', 'Solo puedes registrar hasta 3 metas de ahorro.');
    }
  }

  async function handleDeleteGoal(id: number) {
    Alert.alert('Eliminar meta', '¿Deseas eliminar esta meta de ahorro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const updatedGoals = await deleteGoal(id);
          setGoals(updatedGoals);
        },
      },
    ]);
  }

  async function handleIncreaseGoal(goal: Goal) {
    Alert.prompt(
      'Agregar ahorro',
      `¿Cuánto deseas agregar a "${goal.title}"?`,
      async (value) => {
        const amountToAdd = Number(value?.trim().replace(',', '.'));

        if (isNaN(amountToAdd) || amountToAdd <= 0) {
          Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a 0.');
          return;
        }

        const newCurrentAmount = goal.currentAmount + amountToAdd;

        if (newCurrentAmount > goal.targetAmount) {
          Alert.alert(
            'Meta excedida',
            'El ahorro acumulado no puede superar el monto objetivo.'
          );
          return;
        }

        const updatedGoals = await updateGoal({
          ...goal,
          currentAmount: newCurrentAmount,
        });

        setGoals(updatedGoals);
      },
      'plain-text'
    );
  }

  const totalSaved = goals.reduce((total, goal) => total + goal.currentAmount, 0);
  const totalTarget = goals.reduce((total, goal) => total + goal.targetAmount, 0);
  const generalProgress =
    totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.appName}>FinGo</Text>
      <Text style={styles.title}>Metas de ahorro 🎯</Text>
      <Text style={styles.subtitle}>
        Planifica tus objetivos y registra manualmente tu avance.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Ahorro total en metas</Text>
        <Text style={styles.summaryAmount}>${totalSaved.toFixed(2)}</Text>

        <View style={styles.summaryFooter}>
          <Text style={styles.summaryFooterText}>
            Progreso general: {generalProgress.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.smallCard}>
          <Text style={styles.smallIcon}>🎯</Text>
          <Text style={styles.smallLabel}>Metas</Text>
          <Text style={styles.smallValue}>{goals.length}/3</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.smallIcon}>💰</Text>
          <Text style={styles.smallLabel}>Objetivo</Text>
          <Text style={styles.smallValue}>${totalTarget.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Crear nueva meta</Text>

        <Text style={styles.label}>Nombre de la meta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Laptop, viaje, emergencia"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Monto objetivo</Text>
        <TextInput
          style={styles.input}
          placeholder="$ 0.00"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <Text style={styles.label}>Monto ahorrado actual</Text>
        <TextInput
          style={styles.input}
          placeholder="$ 0.00"
          keyboardType="numeric"
          value={currentAmount}
          onChangeText={setCurrentAmount}
        />

        <Pressable
          style={[
            styles.primaryButton,
            goals.length >= 3 && styles.primaryButtonDisabled,
          ]}
          onPress={handleAddGoal}
          disabled={goals.length >= 3}
        >
          <Text style={styles.primaryButtonText}>
            {goals.length >= 3 ? 'Límite de 3 metas alcanzado' : 'Crear meta'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis metas</Text>
        <Text style={styles.goalCounter}>{goals.length} registros</Text>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>Aún no tienes metas</Text>
          <Text style={styles.emptyText}>
            Crea tu primera meta para empezar a medir tu progreso financiero.
          </Text>
        </View>
      ) : (
        goals.map((goal) => {
          const progress = getGoalProgress(goal);

          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalIconBox}>
                  <Text style={styles.goalIcon}>🎯</Text>
                </View>

                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalAmount}>
                    ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                  </Text>
                </View>

                <Text style={styles.goalPercentage}>{progress.toFixed(0)}%</Text>
              </View>

              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.goalActions}>
                <Pressable
                  style={styles.addSavingButton}
                  onPress={() => handleIncreaseGoal(goal)}
                >
                  <Text style={styles.addSavingText}>Agregar ahorro</Text>
                </Pressable>

                <Pressable onPress={() => handleDeleteGoal(goal.id)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 35,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },
  summaryLabel: {
    color: '#DBEAFE',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: 'bold',
    marginTop: 10,
  },
  summaryFooter: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 10,
    borderRadius: 14,
    marginTop: 18,
  },
  summaryFooterText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  smallCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 18,
    elevation: 2,
  },
  smallIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  smallLabel: {
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  smallValue: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    elevation: 2,
  },
  formTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
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
  primaryButton: {
    backgroundColor: '#10B981',
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: {
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
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  goalCounter: {
    color: '#64748B',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 1,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 8,
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
    lineHeight: 22,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalIcon: {
    fontSize: 22,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  goalAmount: {
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  goalPercentage: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 999,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
    gap: 14,
  },
  addSavingButton: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addSavingText: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});