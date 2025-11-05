/**
 * Reward Punishment System App
 * Sistema de Premios y Castigos
 */

import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
