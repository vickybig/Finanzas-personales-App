import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '@/data/auth';

export type GoalStatus = 'completed' | 'expired' | 'in_progress';

export type Goal = {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
  targetDate: string;
  userEmail?: string;
};

export type GoalProgressHistory = {
  id: number;
  goalId: number;
  amount: number;
  date: string;
  userEmail?: string;
};

const STORAGE_KEY = 'fingo_goals';
const HISTORY_STORAGE_KEY = 'fingo_goal_progress_history';

async function getCurrentUserEmail() {
  const currentUser = await getCurrentUser();
  return currentUser?.email?.trim().toLowerCase() || null;
}

async function loadAllGoals(): Promise<Goal[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  return JSON.parse(data);
}

async function loadAllGoalProgressHistory(): Promise<GoalProgressHistory[]> {
  const data = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);

  if (!data) {
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  return JSON.parse(data);
}

export async function loadGoals(): Promise<Goal[]> {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    return [];
  }

  const allGoals = await loadAllGoals();

  let wasMigrated = false;

  const normalizedGoals = allGoals.map((goal) => {
    const normalizedGoal = {
      ...goal,
      targetDate: goal.targetDate || '',
    };

    if (!normalizedGoal.userEmail) {
      wasMigrated = true;

      return {
        ...normalizedGoal,
        userEmail: currentUserEmail,
      };
    }

    return {
      ...normalizedGoal,
      userEmail: normalizedGoal.userEmail.trim().toLowerCase(),
    };
  });

  if (wasMigrated) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedGoals));
  }

  return normalizedGoals.filter((goal) => goal.userEmail === currentUserEmail);
}

export async function addGoal(goal: Goal) {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    throw new Error('No hay usuario autenticado.');
  }

  const currentGoals = await loadGoals();

  if (currentGoals.length >= 3) {
    throw new Error('Solo puedes registrar hasta 3 metas de ahorro.');
  }

  const allGoals = await loadAllGoals();

  const newGoal: Goal = {
    ...goal,
    userEmail: currentUserEmail,
    targetDate: goal.targetDate || '',
  };

  const updatedGoals = [...allGoals, newGoal];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));

  return updatedGoals.filter((item) => item.userEmail === currentUserEmail);
}

export async function updateGoal(updatedGoal: Goal) {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    throw new Error('No hay usuario autenticado.');
  }

  const allGoals = await loadAllGoals();

  const updatedGoals = allGoals.map((goal) => {
    if (goal.id === updatedGoal.id && goal.userEmail === currentUserEmail) {
      return {
        ...updatedGoal,
        userEmail: currentUserEmail,
        targetDate: updatedGoal.targetDate || '',
      };
    }

    return goal;
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));

  return updatedGoals.filter((item) => item.userEmail === currentUserEmail);
}

export async function deleteGoal(id: number) {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    return [];
  }

  const allGoals = await loadAllGoals();

  const updatedGoals = allGoals.filter(
    (goal) => !(goal.id === id && goal.userEmail === currentUserEmail)
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));

  const allHistory = await loadAllGoalProgressHistory();

  const updatedHistory = allHistory.filter(
    (item) => !(item.goalId === id && item.userEmail === currentUserEmail)
  );

  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

  return updatedGoals.filter((item) => item.userEmail === currentUserEmail);
}

export async function addGoalProgressHistory(goalId: number, amount: number) {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    throw new Error('No hay usuario autenticado.');
  }

  const allHistory = await loadAllGoalProgressHistory();

  const newHistoryItem: GoalProgressHistory = {
    id: Date.now(),
    goalId,
    amount,
    date: new Date().toISOString(),
    userEmail: currentUserEmail,
  };

  const updatedHistory = [...allHistory, newHistoryItem];

  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

  return updatedHistory.filter((item) => item.userEmail === currentUserEmail);
}

export async function loadGoalProgressHistory(
  goalId: number
): Promise<GoalProgressHistory[]> {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    return [];
  }

  const allHistory = await loadAllGoalProgressHistory();

  const normalizedHistory = allHistory.map((item) => ({
    ...item,
    userEmail: item.userEmail
      ? item.userEmail.trim().toLowerCase()
      : currentUserEmail,
  }));

  await AsyncStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(normalizedHistory)
  );

  return normalizedHistory
    .filter(
      (item) => item.goalId === goalId && item.userEmail === currentUserEmail
    )
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
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