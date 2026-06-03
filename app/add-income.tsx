import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddIncomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Ingreso</Text>

      <TextInput style={styles.input} placeholder="Monto del ingreso" keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Descripción" />
      <TextInput style={styles.input} placeholder="Categoría: Salario, Freelance, Ventas..." />

      <TouchableOpacity style={styles.button}>
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