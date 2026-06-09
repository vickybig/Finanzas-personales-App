import AsyncStorage from '@react-native-async-storage/async-storage';

export type GoalStatus = 'completed' | 'expired' | 'in_progress';

export type Goal = {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
  targetDate: string;
};

const STORAGE_KEY = 'fingo_goals';

export async function loadGoals(): Promise<Goal[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (data) {
    const parsedGoals = JSON.parse(data);

    return parsedGoals.map((goal: Goal) => ({
      ...goal,
      targetDate: goal.targetDate || '',
    }));
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

export async function addGoal(goal: Goal) {
  const currentGoals = await loadGoals();

  if (currentGoals.length >= 3) {
    throw new Error('Solo puedes registrar hasta 3 metas de ahorro.');
  }

  const updatedGoals = [...currentGoals, goal];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));

  return updatedGoals;
}

export async function updateGoal(updatedGoal: Goal) {
  const currentGoals = await loadGoals();

  const updatedGoals = currentGoals.map((goal) =>
    goal.id === updatedGoal.id ? updatedGoal : goal
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));

  return updatedGoals;
}

export async function deleteGoal(id: number) {
  const currentGoals = await loadGoals();

  const updatedGoals = currentGoals.filter((goal) => goal.id !== id);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));

  return updatedGoals;
}

export function getGoalProgress(goal: Goal) {
  if (goal.targetAmount <= 0) {
    return 0;
  }

  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  return Math.min(progress, 100);
}

export function getDaysRemaining(goal: Goal) {
  if (!goal.targetDate) {
    return null;
  }

  const today = new Date();
  const target = new Date(goal.targetDate);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const difference = target.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

export function getGoalStatus(goal: Goal): GoalStatus {
  const progress = getGoalProgress(goal);
  const daysRemaining = getDaysRemaining(goal);

  if (progress >= 100) {
    return 'completed';
  }

  if (daysRemaining !== null && daysRemaining < 0) {
    return 'expired';
  }

  return 'in_progress';
}

export function getGoalStatusText(goal: Goal) {
  const status = getGoalStatus(goal);

  if (status === 'completed') {
    return '🏆 Completada';
  }

  if (status === 'expired') {
    return '🔴 Vencida';
  }

  return '🟢 En progreso';
}