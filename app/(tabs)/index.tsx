import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>
            Fin<Text style={styles.logoGreen}>Go</Text>
          </Text>

          <Text style={styles.subtitle}>
            Controla tu dinero de forma simple, rápida y segura.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>💰</Text>
          </View>

          <Text style={styles.heroTitle}>Tu bienestar financiero empieza aquí</Text>

          <Text style={styles.heroText}>
            Registra ingresos, controla gastos, crea metas y analiza tus hábitos en un solo lugar.
          </Text>
        </View>

        
      </View>

      <View style={styles.buttonsBox}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/register')}>
          <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FFF7',
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 34,
    justifyContent: 'space-between',
  },

  bgCircleTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#D9FBE4',
    top: -130,
    left: -110,
  },

  bgCircleBottom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#C7F8D8',
    bottom: -180,
    right: -140,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  logoBox: {
    alignItems: 'center',
    marginBottom: 40,
  },

  logo: {
    fontSize: 58,
    fontWeight: '900',
    color: '#172033',
    letterSpacing: -2,
  },

  logoGreen: {
    color: '#16A34A',
  },

  subtitle: {
    marginTop: 12,
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '600',
  },

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#14532D',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  iconText: {
    fontSize: 36,
  },

  heroTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#172033',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },

  heroText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 23,
  },

  features: {
    marginTop: 28,
    marginBottom: 40,
    gap: 12,
    alignItems: 'center',
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  

  featureDot: {
    color: '#16A34A',
    fontSize: 16,
    marginRight: 8,
  },

  featureText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '700',
  },

  buttonsBox: {
    width: '100%',
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#16A34A',
    paddingVertical: 17,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },

  secondaryButton: {
    width: '100%',
    marginTop: 14,
    paddingVertical: 15,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#16A34A',
    alignItems: 'center',
    backgroundColor: '#F8FFFA',
  },

  secondaryButtonText: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: '900',
  },
});