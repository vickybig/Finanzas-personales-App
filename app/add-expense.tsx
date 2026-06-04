import { addTransaction } from '@/data/transactions';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  async function handleSaveExpense() {
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

    await addTransaction({
      id: Date.now(),
      type: 'expense',
      amount: numericAmount,
      description: cleanDescription,
      category: cleanCategory,
    });

    setAmount('');
    setDescription('');
    setCategory('');

    Alert.alert('Gasto guardado', 'El gasto se registró correctamente.');
    router.push('/dashboard');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Gasto</Text>

      <TextInput
        style={styles.input}
        placeholder="Monto del gasto"
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
        placeholder="Categoría: Alimentación, Transporte, Servicios..."
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveExpense}>
        <Text style={styles.buttonText}>Guardar Gasto</Text>
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
    fontSize: 30,
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
    backgroundColor: '#DC2626',
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