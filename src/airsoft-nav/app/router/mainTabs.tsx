// src/airsoft-nav/app/router/mainTabs.tsx
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';

import {TeamStack} from './team';
import {SettingsStack} from './settings';
import {AuthenticatedMapScreen} from '@src/airsoft-nav/screens/Map/AuthenticatedMapScreen';
import {MapIcon} from '@src/airsoft-nav/ui/icons/MapIcon';
import {TeamIcon} from '@src/airsoft-nav/ui/icons/TeamIcon';
import {SettingsIcon} from '@src/airsoft-nav/ui/icons/SettingsIcon';
import {getColorByValue} from '../utils/helpers';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';

const Tab = createBottomTabNavigator();

export const MainTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: COLORS.primary,
                borderTopColor: COLORS.primary,
                height: 80,
                paddingTop: 5,
            },
            tabBarLabelStyle: {
                fontSize: 15, // ← размер текста
                fontWeight: '400',
            },
            tabBarActiveTintColor: COLORS.secondary,
            tabBarInactiveTintColor: COLORS.contrast,
        }}
    >
        <Tab.Screen
            component={AuthenticatedMapScreen}
            name='Map'
            options={{
                tabBarLabel: 'Карта',
                tabBarIcon: ({color}) => {
                    return <MapIcon color={getColorByValue(color)} />;
                },
            }}
        />
        <Tab.Screen
            component={TeamStack}
            name='TeamStack'
            options={{
                tabBarLabel: 'Команда',
                tabBarIcon: ({color}) => <TeamIcon color={getColorByValue(color)} />,
            }}
        />
        <Tab.Screen
            component={SettingsStack}
            name='Settings'
            options={{
                tabBarLabel: 'Настройки',
                tabBarIcon: ({color}) => <SettingsIcon color={getColorByValue(color)} />,
            }}
        />
    </Tab.Navigator>
);
