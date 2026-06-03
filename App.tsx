import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {QueryClientProvider} from '@src/airsoft-nav/app/providers/QueryClientProvider';
import {AuthProvider} from '@src/airsoft-nav/app/contexts/AuthContext';
import {AppRouter} from '@src/airsoft-nav/app/router';

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <QueryClientProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
