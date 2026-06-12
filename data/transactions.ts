import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '@/data/auth';

export type Transaction = {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;

  userEmail?: string;

  source?: 'manual' | 'goal';
  locked?: boolean;
  goalId?: number;
};

const STORAGE_KEY = 'fingo_transactions';

async function getCurrentUserEmail() {
  const currentUser = await getCurrentUser();
  return currentUser?.email?.trim().toLowerCase() || null;
}

async function loadAllTransactions(): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  return JSON.parse(data);
}

export async function loadTransactions(): Promise<Transaction[]> {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    return [];
  }

  const allTransactions = await loadAllTransactions();

  let wasMigrated = false;

  const normalizedTransactions = allTransactions.map((transaction) => {
    const normalizedTransaction = {
      ...transaction,
      date: transaction.date || new Date(transaction.id).toISOString(),
    };

    if (!normalizedTransaction.userEmail) {
      wasMigrated = true;

      return {
        ...normalizedTransaction,
        userEmail: currentUserEmail,
      };
    }

    return {
      ...normalizedTransaction,
      userEmail: normalizedTransaction.userEmail.trim().toLowerCase(),
    };
  });

  if (wasMigrated) {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizedTransactions)
    );
  }

  return normalizedTransactions.filter(
    (transaction) => transaction.userEmail === currentUserEmail
  );
}

export async function addTransaction(transaction: Transaction) {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    throw new Error('No hay usuario autenticado.');
  }

  const allTransactions = await loadAllTransactions();

  const newTransaction: Transaction = {
    ...transaction,
    userEmail: currentUserEmail,
    date: transaction.date || new Date().toISOString(),
  };

  const updatedTransactions = [...allTransactions, newTransaction];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));

  return updatedTransactions.filter(
    (item) => item.userEmail === currentUserEmail
  );
}

export async function deleteTransaction(id: number) {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    return [];
  }

  const allTransactions = await loadAllTransactions();

  const updatedTransactions = allTransactions.filter(
    (transaction) =>
      !(transaction.id === id && transaction.userEmail === currentUserEmail)
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));

  return updatedTransactions.filter(
    (item) => item.userEmail === currentUserEmail
  );
}

export async function updateTransaction(updatedTransaction: Transaction) {
  const currentUserEmail = await getCurrentUserEmail();

  if (!currentUserEmail) {
    throw new Error('No hay usuario autenticado.');
  }

  const allTransactions = await loadAllTransactions();

  const updatedTransactions = allTransactions.map((transaction) => {
    if (transaction.id === updatedTransaction.id && transaction.userEmail === currentUserEmail) {
      return {
        ...updatedTransaction,
        userEmail: currentUserEmail,
      };
    }

    return transaction;
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));

  return updatedTransactions.filter(
    (item) => item.userEmail === currentUserEmail
  );
}

export function getTotalIncome(transactionList: Transaction[]) {
  return transactionList
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0);
}

export function getTotalExpense(transactionList: Transaction[]) {
  return transactionList
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0);
}

export function getBalance(transactionList: Transaction[]) {
  return getTotalIncome(transactionList) - getTotalExpense(transactionList);
}