import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddExpenseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Gasto</Text>

      <TextInput style={styles.input} placeholder="Monto del gasto" keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Descripción" />
      <TextInput style={styles.input} placeholder="Categoría: Alimentación, Transporte, Servicios..." />

      <TouchableOpacity style={styles.button}>
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