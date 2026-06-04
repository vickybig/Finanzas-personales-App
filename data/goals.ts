import AsyncStorage from '@react-native-async-storage/async-storage';

export type Goal = {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
};

const STORAGE_KEY = 'fingo_goals';

export async function loadGoals(): Promise<Goal[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (data) {
    return JSON.parse(data);
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