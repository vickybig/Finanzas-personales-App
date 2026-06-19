import DateTimePicker from '@react-native-community/datetimepicker';
import { addTransaction } from '@/data/transactions';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
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

export default function AddIncomeScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formattedDate = selectedDate.toLocaleDateString('es-EC');

  async function handleSaveIncome() {
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

    await addTransaction({
      id: Date.now(),
      type: 'income',
      amount: numericAmount,
      description: cleanDescription,
      category,
      date: selectedDate.toISOString(),
    });

    setAmount('');
    setDescription('');
    setCategory('');
    setSelectedDate(new Date());

    Alert.alert('Ingreso guardado', 'El ingreso se registró correctamente.');
    router.push('/dashboard');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.appName}>FINGO</Text>
      <Text style={styles.title}>Registrar Ingreso</Text>

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        placeholder="$ 0.00"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Sueldo mensual"
        placeholderTextColor="#94A3B8"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Categoría</Text>

      <View style={styles.categoriesContainer}>
        {incomeCategories.map((item) => {
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

      <Text style={styles.label}>Fecha</Text>

      <TouchableOpacity
        style={styles.dateBox}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);

            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSaveIncome}>
        <Text style={styles.buttonText}>Guardar Ingreso</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 55,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
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
    color: '#1E293B',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  dateBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#0F172A',
  },
  calendarIcon: {
    fontSize: 18,
  },
  button: {
    backgroundColor: '#10B981',
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
  backText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 14,
  },
});