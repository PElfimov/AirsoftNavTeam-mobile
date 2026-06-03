// src/airsoft-nav/app/router/team.tsx
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {PlayerDetailScreen} from '@src/airsoft-nav/screens/team/PlayerDetailScreen';
import {TeamSettingsScreen} from '@src/airsoft-nav/screens/team/TeamSettingsScreen';
import {SettingsScreen} from '@src/airsoft-nav/screens/settings/SettingsScreen';
import {ServerSettingsScreen} from '@src/airsoft-nav/screens/settings/ServerSettingsScreen';

export type TeamStackParamList = {
    Settings: undefined;
    TeamSettings: undefined;
    PlayerDetail: {teamId: string; playerId?: string};
    ServerSettings: undefined;
};

const Stack = createStackNavigator<TeamStackParamList>();

export const SettingsStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {backgroundColor: '#2c2c2c'},
            headerTintColor: '#fff',
            headerTitleStyle: {fontWeight: 'bold'},
            cardStyle: {backgroundColor: '#1a1a1a'},
        }}
    >
        <Stack.Screen component={SettingsScreen} name='Settings' options={{title: 'Настройки'}} />
        <Stack.Screen component={TeamSettingsScreen} name='TeamSettings' options={{title: 'Настройки команд'}} />
        <Stack.Screen
            component={PlayerDetailScreen}
            name='PlayerDetail'
            options={({route}) => ({
                title: route.params?.playerId ? 'Редактировать игрока' : 'Новый игрок',
            })}
        />
        <Stack.Screen component={ServerSettingsScreen} name='ServerSettings' options={{title: 'Настройки сервера'}} />
    </Stack.Navigator>
);
