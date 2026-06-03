export type Transaction = {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
};

export const transactions: Transaction[] = [
  {
    id: 1,
    type: 'income',
    amount: 500,
    description: 'Salario',
    category: 'Trabajo',
  },
  {
    id: 2,
    type: 'expense',
    amount: 80,
    description: 'Supermercado',
    category: 'Alimentación',
  },
  {
    id: 3,
    type: 'expense',
    amount: 20,
    description: 'Transporte',
    category: 'Movilidad',
  },
];

export function getTotalIncome() {
  return transactions
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0);
}

export function getTotalExpense() {
  return transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0);
}

export function getBalance() {
  return getTotalIncome() - getTotalExpense();
}

export function addTransaction(transaction: Transaction) {
  transactions.push(transaction);
}