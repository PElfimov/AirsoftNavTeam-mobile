// src/airsoft-nav/app/router/team.tsx
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {PlayerDetailScreen} from '@src/airsoft-nav/screens/team/PlayerDetailScreen';
import {TeamScreen} from '@src/airsoft-nav/screens/team/TeamScreen';
import {TeamSettingsScreen} from '@src/airsoft-nav/screens/team/TeamSettingsScreen';

export type TeamStackParamList = {
    TeamList: undefined;
    TeamSettings: undefined;
    PlayerDetail: {teamId: string; playerId?: string};
};

const Stack = createStackNavigator<TeamStackParamList>();

export const TeamStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {backgroundColor: '#2c2c2c'},
            headerTintColor: '#fff',
            headerTitleStyle: {fontWeight: 'bold'},
            cardStyle: {backgroundColor: '#1a1a1a'},
        }}
    >
        <Stack.Screen component={TeamScreen} name='TeamList' options={{title: 'Мои команды'}} />
        <Stack.Screen component={TeamSettingsScreen} name='TeamSettings' options={{title: ''}} />
        <Stack.Screen
            component={PlayerDetailScreen}
            name='PlayerDetail'
            options={({route}) => ({
                title: route.params?.playerId ? 'Редактировать игрока' : 'Новый игрок',
            })}
        />
    </Stack.Navigator>
);
