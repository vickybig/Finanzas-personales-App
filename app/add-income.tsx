import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addTransaction, transactions } from '@/data/transactions';

export default function AddIncomeScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  function handleSaveIncome() {
    if (!amount || !description || !category) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const numericAmount = Number(amount);

    if (numericAmount <= 0 || isNaN(numericAmount)) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a 0.');
      return;
    }

    addTransaction({
      id: transactions.length + 1,
      type: 'income',
      amount: numericAmount,
      description,
      category,
    });

    Alert.alert('Ingreso guardado', 'El ingreso se registró correctamente.');
    router.push('/dashboard');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Ingreso</Text>

      <TextInput
        style={styles.input}
        placeholder="Monto del ingreso"
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
        placeholder="Categoría: Salario, Freelance, Ventas..."
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveIncome}>
        <Text style={styles.buttonText}>Guardar Ingreso</Text>
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
    backgroundColor: '#16A34A',
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