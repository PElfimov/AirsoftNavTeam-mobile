// src/airsoft-nav/app/screens/settings/SettingsScreen.tsx
import React, {FC} from 'react';
import styled from 'styled-components/native';
import {Alert, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useAuth} from '@src/airsoft-nav/app/contexts/AuthContext';
import {useTeamMutations, useTeams} from '@src/airsoft-nav/app/hooks/useTeams';

const Container = styled.View`
    flex: 1;
    background-color: #1a1a1a;
    padding: 20px;
`;

const Section = styled.View`
    margin-bottom: 25px;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 15px;
    padding-left: 10px;
`;

const MenuItem = styled.TouchableOpacity`
    background-color: #2c2c2c;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 10px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const MenuItemContent = styled.View`
    flex: 1;
`;

const MenuItemTitle = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
`;

const MenuItemSubtitle = styled.Text`
    color: #aaa;
    font-size: 13px;
`;

const MenuItemArrow = styled.Text`
    color: #e74c3c;
    font-size: 24px;
    margin-left: 10px;
`;

export const SettingsScreen: FC = () => {
    const navigation = useNavigation<any>();
    const {logout} = useAuth();
    const {data: teams = []} = useTeams();
    const {deleteAllTeams} = useTeamMutations();

    const handleLogout = () => {
        Alert.alert('Выход из аккаунта', 'Вы уверены, что хотите выйти?', [
            {text: 'Отмена', style: 'cancel'},
            {
                text: 'Выйти',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    deleteAllTeams.mutate();
                },
            },
        ]);
    };

    const playerCount = teams.reduce((sum, team) => sum + team.players.length, 0);

    return (
        <Container>
            <ScrollView bounces={true} contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
                <Section>
                    <SectionTitle>Команды и игроки</SectionTitle>
                    <MenuItem onPress={() => navigation.navigate('TeamSettings')}>
                        <MenuItemContent>
                            <MenuItemTitle>Управление командами</MenuItemTitle>
                            <MenuItemSubtitle>
                                Команд: {teams.length} | Игроков: {playerCount}
                            </MenuItemSubtitle>
                        </MenuItemContent>
                        <MenuItemArrow>→</MenuItemArrow>
                    </MenuItem>

                    <MenuItem onPress={() => navigation.navigate('PlayerDetail', {teamId: teams[0]?.id || ''})}>
                        <MenuItemContent>
                            <MenuItemTitle>Добавить игрока</MenuItemTitle>
                            <MenuItemSubtitle>Добавить нового участника в команду</MenuItemSubtitle>
                        </MenuItemContent>
                        <MenuItemArrow>→</MenuItemArrow>
                    </MenuItem>
                </Section>

                <Section>
                    <SectionTitle>Сервер</SectionTitle>

                    <MenuItem onPress={() => navigation.navigate('ServerSettings')}>
                        <MenuItemContent>
                            <MenuItemTitle>Настройки подключения</MenuItemTitle>
                            <MenuItemSubtitle>Подключение к GPS-трекеру и радиостанциям</MenuItemSubtitle>
                        </MenuItemContent>
                        <MenuItemArrow>→</MenuItemArrow>
                    </MenuItem>

                    {/* <MenuItem
                    onPress={() =>
                        Alert.alert('Функция в разработке', 'Синхронизация с радиостанциями будет добавлена позже')
                    }
                >
                    <MenuItemContent>
                        <MenuItemTitle>Радиостанции DMR</MenuItemTitle>
                        <MenuItemSubtitle>Подключение к хотспотам и настройка GPS</MenuItemSubtitle>
                    </MenuItemContent>
                    <MenuItemArrow>→</MenuItemArrow>
                </MenuItem> */}
                </Section>

                <Section>
                    <SectionTitle>Аккаунт</SectionTitle>

                    <MenuItem onPress={handleLogout}>
                        <MenuItemContent>
                            <MenuItemTitle>Выйти из аккаунта</MenuItemTitle>
                            <MenuItemSubtitle>Переключиться в базовый режим</MenuItemSubtitle>
                        </MenuItemContent>
                        <MenuItemArrow>→</MenuItemArrow>
                    </MenuItem>
                </Section>
            </ScrollView>
        </Container>
    );
};
