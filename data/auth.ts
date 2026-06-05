import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

const USERS_KEY = 'fingo_users';
const SESSION_KEY = 'fingo_session';

export async function loadUsers(): Promise<User[]> {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function registerUser(name: string, email: string, password: string) {
  const users = await loadUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    throw new Error('Ya existe una cuenta con este correo.');
  }

  const newUser: User = {
    id: Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));

  return newUser;
}

export async function loginUser(email: string, password: string) {
  const users = await loadUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === password
  );

  if (!user) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));

  return user;
}

export async function getCurrentUser(): Promise<User | null> {
  const data = await AsyncStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export async function logoutUser() {
  await AsyncStorage.removeItem(SESSION_KEY);
}