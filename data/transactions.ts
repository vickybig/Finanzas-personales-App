import AsyncStorage from '@react-native-async-storage/async-storage';

export type Transaction = {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  goalId?: number;
};

const STORAGE_KEY = 'fingo_transactions';

const initialTransactions: Transaction[] = [
  {
    id: 1,
    type: 'income',
    amount: 500,
    description: 'Salario',
    category: 'Trabajo',
    date: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'expense',
    amount: 80,
    description: 'Supermercado',
    category: 'Alimentación',
    date: new Date().toISOString(),
  },
  {
    id: 3,
    type: 'expense',
    amount: 20,
    description: 'Transporte',
    category: 'Movilidad',
    date: new Date().toISOString(),
  },
];

export async function loadTransactions(): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (data) {
    const parsedTransactions: Transaction[] = JSON.parse(data);

    return parsedTransactions.map((transaction) => ({
      ...transaction,
      date: transaction.date || new Date(transaction.id).toISOString(),
    }));
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialTransactions));
  return initialTransactions;
}

export async function addTransaction(transaction: Transaction) {
  const currentTransactions = await loadTransactions();
  const updatedTransactions = [...currentTransactions, transaction];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));

  return updatedTransactions;
}

export async function deleteTransaction(id: number) {
  const currentTransactions = await loadTransactions();

  const updatedTransactions = currentTransactions.filter(
    (transaction) => transaction.id !== id
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));

  return updatedTransactions;
}

export async function updateTransaction(updatedTransaction: Transaction) {
  const currentTransactions = await loadTransactions();

  const updatedTransactions = currentTransactions.map((transaction) =>
    transaction.id === updatedTransaction.id ? updatedTransaction : transaction
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));

  return updatedTransactions;
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