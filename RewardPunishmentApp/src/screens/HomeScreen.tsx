import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ConnectionTest } from '../components';

interface NavigationCard {
  title: string;
  description: string;
  screen: string;
  color: string;
  icon: string;
}

const navigationCards: NavigationCard[] = [
  {
    title: 'Gestión de Personas',
    description: 'Crear y administrar personas en el sistema',
    screen: 'Persons',
    color: '#007AFF',
    icon: '👥',
  },
  {
    title: 'Gestión de Premios',
    description: 'Crear y administrar premios con valores positivos',
    screen: 'Rewards',
    color: '#34C759',
    icon: '🏆',
  },
  {
    title: 'Gestión de Castigos',
    description: 'Crear y administrar castigos con valores negativos',
    screen: 'Punishments',
    color: '#FF3B30',
    icon: '⚠️',
  },
  {
    title: 'Asignar Premio/Castigo',
    description: 'Asignar premios o castigos a personas',
    screen: 'Assignment',
    color: '#FF9500',
    icon: '📝',
  },
  {
    title: 'Puntuaciones Totales',
    description: 'Ver ranking y puntuaciones acumuladas',
    screen: 'Scores',
    color: '#5856D6',
    icon: '📊',
  },
  {
    title: 'Vista Semanal',
    description: 'Ver puntuaciones de la semana actual',
    screen: 'Weekly',
    color: '#32D74B',
    icon: '📅',
  },
  {
    title: 'Historial',
    description: 'Ver y gestionar historial de asignaciones',
    screen: 'History',
    color: '#8E8E93',
    icon: '📋',
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isLoading, error } = useSelector((state: RootState) => state.ui);

  const handleCardPress = (screen: string) => {
    try {
      navigation.navigate(screen as never);
    } catch {
      Alert.alert(
        'Error de Navegación',
        'No se pudo navegar a la pantalla solicitada. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderNavigationCard = (card: NavigationCard) => (
    <TouchableOpacity
      key={card.screen}
      style={[styles.card, { borderLeftColor: card.color }]}
      onPress={() => handleCardPress(card.screen)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{card.icon}</Text>
          <Text style={[styles.cardTitle, { color: card.color }]}>
            {card.title}
          </Text>
        </View>
        <Text style={styles.cardDescription}>{card.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sistema de Premios y Castigos</Text>
        <Text style={styles.headerSubtitle}>
          Gestiona premios, castigos y puntuaciones
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* <ConnectionTest /> */}

        <View style={styles.cardsContainer}>
          {navigationCards.map(renderNavigationCard)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Selecciona una opción para comenzar
          </Text>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
});