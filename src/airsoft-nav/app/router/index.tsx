import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text} from 'react-native';

import {MainTabs} from './mainTabs';
import {useAuth} from '../contexts/AuthContext';
import {LoginScreen} from '@src/airsoft-nav/screens/auth/LoginScreen';
import {UnauthenticatedMapScreen} from '@src/airsoft-nav/screens/Map/UnauthenticatedMapScreen';

export type RootStackParamList = {
    UnauthenticatedMap: undefined;
    Login: undefined;
    MainTabs: undefined;
    Register: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AuthenticatedApp: React.FC = () => {
    const {isAuthenticated, loading} = useAuth();

    if (loading) {
        return (
            <View style={{flex: 1, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#fff', fontSize: 24}}>Загрузка...</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            {isAuthenticated ? (
                <Stack.Screen component={MainTabs} name='MainTabs' />
            ) : (
                <>
                    <Stack.Screen component={UnauthenticatedMapScreen} name='UnauthenticatedMap' />
                    <Stack.Screen component={LoginScreen} name='Login' />
                </>
            )}
        </Stack.Navigator>
    );
};

export const AppRouter: React.FC = () => {
    return (
        <NavigationContainer>
            <AuthenticatedApp />
        </NavigationContainer>
    );
};
