import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, logoutUser } from '@/data/auth';
import { cancelAllReminders, scheduleDailyReminder } from '@/data/notifications';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function loadUser() {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          setEditedName(currentUser.name || '');
          setEditedEmail(currentUser.email || '');
        }
      }

      loadUser();
    }, [])
  );

  async function updateUserInStorage(updatedUser: any) {
    const keys = await AsyncStorage.getAllKeys();

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);

      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          const updatedArray = parsed.map((item) =>
            item?.email === user.email ? { ...item, ...updatedUser } : item
          );

          await AsyncStorage.setItem(key, JSON.stringify(updatedArray));
        }

        if (parsed?.email === user.email) {
          await AsyncStorage.setItem(
            key,
            JSON.stringify({ ...parsed, ...updatedUser })
          );
        }
      } catch {
        // Ignora valores que no sean JSON
      }
    }
  }

  async function handleSaveProfile() {
    if (!editedName.trim() || !editedEmail.trim()) {
      Alert.alert('Campos incompletos', 'Debes ingresar nombre y correo.');
      return;
    }

    const updatedUser = {
      ...user,
      name: editedName.trim(),
      email: editedEmail.trim(),
    };

    await updateUserInStorage(updatedUser);
    setUser(updatedUser);
    setIsEditing(false);

    Alert.alert('Perfil actualizado ✅', 'Tus datos fueron guardados correctamente.');
  }

  function handleCancelEdit() {
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
    setIsEditing(false);
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          router.replace('/login');
        },
      },
    ]);
  }

  async function handleEnableNotifications() {
    try {
      await scheduleDailyReminder();

      Alert.alert(
        'Recordatorio activado 🔔',
        'FinGo te recordará todos los días a las 8:00 PM revisar tus finanzas.'
      );
    } catch {
      Alert.alert(
        'Permiso requerido',
        'Debes permitir notificaciones para activar los recordatorios.'
      );
    }
  }

  async function handleDisableNotifications() {
    await cancelAllReminders();

    Alert.alert(
      'Recordatorios desactivados',
      'Ya no recibirás avisos de FinGo.'
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      <Text style={styles.appName}>FinGo</Text>
      <Text style={styles.title}>Mi Perfil 👤</Text>
      <Text style={styles.subtitle}>
        Información de tu cuenta y configuración básica.
      </Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>

        <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email || 'correo no disponible'}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Datos de cuenta</Text>

          {!isEditing && (
            <Pressable onPress={() => setIsEditing(true)}>
              <Text style={styles.editText}>Editar</Text>
            </Pressable>
          )}
        </View>

        {isEditing ? (
          <>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Ingresa tu nombre"
            />

            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput
              style={styles.input}
              value={editedEmail}
              onChangeText={setEditedEmail}
              placeholder="Ingresa tu correo"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Pressable style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{user?.name || 'No registrado'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Correo</Text>
              <Text style={styles.infoValue}>{user?.email || 'No registrado'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Moneda</Text>
              <Text style={styles.infoValue}>USD ($)</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cuenta creada</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('es-EC')
                  : 'No disponible'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <Pressable
          style={styles.notificationButton}
          onPress={handleEnableNotifications}
        >
          <Text style={styles.notificationButtonText}>
            Activar recordatorio diario 🔔
          </Text>
        </Pressable>

        <Pressable
          style={styles.disableButton}
          onPress={handleDisableNotifications}
        >
          <Text style={styles.disableButtonText}>Desactivar recordatorios</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
    marginBottom: 22,
  },
  profileCard: {
    backgroundColor: '#2563EB',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#2563EB',
    fontSize: 34,
    fontWeight: 'bold',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    color: '#DBEAFE',
    fontSize: 15,
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  editText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 13,
  },
  infoLabel: {
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 5,
  },
  infoValue: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputLabel: {
    color: '#64748B',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notificationButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disableButton: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disableButtonText: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});