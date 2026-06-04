import {
  loadTransactions,
  Transaction,
  updateTransaction,
} from '@/data/transactions';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

      setTransaction(selectedTransaction);
      setAmount(String(selectedTransaction.amount));
      setDescription(selectedTransaction.description);
      setCategory(selectedTransaction.category);
    }

    loadTransaction();
  }, [id]);

  async function handleUpdateTransaction() {
    if (!transaction) return;

    const cleanAmount = amount.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    if (!cleanAmount || !cleanDescription || !cleanCategory) {
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
      category: cleanCategory,
    });

    Alert.alert('Movimiento actualizado', 'La transacción se actualizó correctamente.');
    router.push('/dashboard');
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cargando movimiento...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Editar {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Monto"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateTransaction}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F4F7FB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});