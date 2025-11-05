import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ErrorBoundary, LoadingIndicator, NetworkErrorHandler } from '../components';
import {
  HomeScreen,
  PersonManagement,
  RewardManagement,
  PunishmentManagement,
  AssignmentManagement,
  AssignmentHistoryScreen,
  TotalScoresScreen,
  WeeklyScoresScreen,
} from '../screens';

const Tab = createBottomTabNavigator();

const tabIconStyle = { fontSize: 20 };

const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => (
  <Text style={[tabIconStyle, { color }]}>{icon}</Text>
);

export const AppNavigator: React.FC = () => {
  const { isLoading } = useSelector((state: RootState) => state.ui);

  const handleNetworkRetry = () => {
    // This can be extended to retry specific network operations
    console.log('Retrying network operation...');
  };

  return (
    <ErrorBoundary>
      <NavigationContainer
        onStateChange={(state) => {
          // Track navigation state changes for debugging
          console.log('Navigation state changed:', state);
        }}
        fallback={<LoadingIndicator message="Inicializando aplicación..." />}
      >
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopColor: '#E5E5EA',
              borderTopWidth: 1,
            },
            headerStyle: {
              backgroundColor: '#FFFFFF',
              borderBottomColor: '#E5E5EA',
              borderBottomWidth: 1,
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: '#1C1C1E',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Inicio',
              tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
            }}
          />
          <Tab.Screen
            name="Persons"
            component={PersonManagement}
            options={{
              title: 'Personas',
              tabBarIcon: ({ color }) => <TabIcon icon="👥" color={color} />,
            }}
          />
          <Tab.Screen
            name="Rewards"
            component={RewardManagement}
            options={{
              title: 'Premios',
              tabBarIcon: ({ color }) => <TabIcon icon="🏆" color={color} />,
            }}
          />
          <Tab.Screen
            name="Punishments"
            component={PunishmentManagement}
            options={{
              title: 'Castigos',
              tabBarIcon: ({ color }) => <TabIcon icon="⚠️" color={color} />,
            }}
          />
          <Tab.Screen
            name="Assignment"
            component={AssignmentManagement}
            options={{
              title: 'Asignar',
              tabBarIcon: ({ color }) => <TabIcon icon="📝" color={color} />,
            }}
          />
          <Tab.Screen
            name="History"
            component={AssignmentHistoryScreen}
            options={{
              title: 'Historial',
              tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />,
            }}
          />
          <Tab.Screen
            name="Scores"
            component={TotalScoresScreen}
            options={{
              title: 'Puntuaciones',
              tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
            }}
          />
          <Tab.Screen
            name="Weekly"
            component={WeeklyScoresScreen}
            options={{
              title: 'Semanal',
              tabBarIcon: ({ color }) => <TabIcon icon="📅" color={color} />,
            }}
          />
        </Tab.Navigator>

        {/* Global loading overlay */}
        {isLoading && (
          <LoadingIndicator overlay message="Procesando..." />
        )}

        {/* Network error handler */}
        <NetworkErrorHandler onRetry={handleNetworkRetry} />
      </NavigationContainer>
    </ErrorBoundary>
  );
};