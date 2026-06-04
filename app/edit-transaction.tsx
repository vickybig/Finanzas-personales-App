import {
  loadTransactions,
  Transaction,
  updateTransaction,
} from '@/data/transactions';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const incomeCategories = [
  { name: 'Salario', icon: '💼' },
  { name: 'Freelance', icon: '💻' },
  { name: 'Negocio', icon: '🏪' },
  { name: 'Inversiones', icon: '📈' },
  { name: 'Bonos', icon: '🎁' },
  { name: 'Ventas', icon: '🛒' },
  { name: 'Regalos', icon: '🎉' },
  { name: 'Otros', icon: '📦' },
];

const expenseCategories = [
  { name: 'Alimentación', icon: '🍔' },
  { name: 'Transporte', icon: '🚗' },
  { name: 'Vivienda', icon: '🏠' },
  { name: 'Entretenimiento', icon: '🎮' },
  { name: 'Servicios', icon: '📄' },
  { name: 'Restaurantes', icon: '🍽️' },
  { name: 'Salud', icon: '❤️' },
  { name: 'Trabajo', icon: '💼' },
  { name: 'Otros', icon: '📦' },
];

function normalizeCategory(type: Transaction['type'], category: string) {
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const cleanCategory = category.trim();

  const exists = categories.some((item) => item.name === cleanCategory);

  return exists ? cleanCategory : 'Otros';
}

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    async function loadTransaction() {
      const transactions = await loadTransactions();
      const selectedTransaction = transactions.find(
        (item) => item.id === Number(id)
      );

      if (!selectedTransaction) {
        Alert.alert('Error', 'No se encontró la transacción.');
        router.push('/dashboard');
        return;
      }

      const normalizedCategory = normalizeCategory(
        selectedTransaction.type,
        selectedTransaction.category
      );

      setTransaction(selectedTransaction);
      setAmount(String(selectedTransaction.amount));
      setDescription(selectedTransaction.description);
      setCategory(normalizedCategory);
    }

    loadTransaction();
  }, [id]);

  async function handleUpdateTransaction() {
    if (!transaction) return;

    const cleanAmount = amount.trim();
    const cleanDescription = description.trim();

    if (!cleanAmount || !cleanDescription || !category) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const numericAmount = Number(cleanAmount.replace(',', '.'));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a 0.');
      return;
    }

    await updateTransaction({
      ...transaction,
      amount: numericAmount,
      description: cleanDescription,
      category,
    });

    Alert.alert(
      'Movimiento actualizado',
      'La transacción se actualizó correctamente.'
    );
    router.push('/dashboard');
  }

  if (!transaction) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>Cargando movimiento...</Text>
      </View>
    );
  }

  const categories =
    transaction.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.appName}>FINLY</Text>

      <Text style={styles.title}>
        Editar {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
      </Text>

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        placeholder="$ 0.00"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Categoría</Text>

      <View style={styles.categoriesContainer}>
        {categories.map((item) => {
          const isSelected = category === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.categoryButton,
                isSelected && styles.categoryButtonSelected,
              ]}
              onPress={() => setCategory(item.name)}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateTransaction}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 100,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 26,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    transform: [{ scale: 1.03 }],
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});