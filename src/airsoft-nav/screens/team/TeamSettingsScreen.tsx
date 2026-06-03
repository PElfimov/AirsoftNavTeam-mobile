// src/airsoft-nav/app/screens/team/TeamSettingsScreen.tsx
import React, {useRef, useState} from 'react';
import styled from 'styled-components/native';
import {FlatList, TouchableOpacity, Alert, Text, ScrollView} from 'react-native';

import {useTeams, useTeamMutations, useActiveTeams} from '@src/airsoft-nav/app/hooks/useTeams';
import {IconButton} from '@src/airsoft-nav/ui/controls/IconButton';
import {TeamIcon} from '@src/airsoft-nav/ui/icons/TeamIcon';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';
import {Input} from '@src/airsoft-nav/ui/controls/Input';
import {Button} from '@src/airsoft-nav/ui/controls/Button';
import {ColorInput} from '@src/airsoft-nav/ui/controls/ColorInput/ColorInput';
import {TeamItem} from './components/TeamItem';

const Container = styled.View`
    flex: 1;
    background-color: #1a1a1a;
    padding: 20px;
`;

const Header = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
`;

const HeaderTitle = styled.Text`
    color: #fff;
    font-size: 22px;
    font-weight: bold;
`;

const SectionTitle = styled.Text`
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    margin-top: 10px;
`;

const TeamForm = styled.View`
    background-color: #2c2c2c;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 25px;
`;

const FormRow = styled.View<{isLast?: boolean}>`
    margin-bottom: ${({isLast}) => (isLast ? '30' : '20')}px;
`;

const FormLabel = styled.Text`
    color: ${COLORS.inverse};
    font-size: 15px;
    margin-bottom: 15px;
    margin-left: 10px;
`;

const TeamList = styled.View`
    margin-top: 10px;
`;

const EmptyState = styled.View`
    align-items: center;
    justify-content: center;
    padding: 40px;
    flex: 1;
`;

const EmptyText = styled.Text`
    color: ${COLORS.inverse};
    font-size: 15px;
    text-align: center;
    margin-top: 15px;
    font-weight: 400;
`;

export const TeamSettingsScreen = () => {
    const {data: teams = []} = useTeams();
    const {data: activeTeamsId} = useActiveTeams();
    const {addTeam, updateTeam, deleteTeam, toggleActiveTeam} = useTeamMutations();
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [teamName, setTeamName] = useState('');
    const [teamColor, setTeamColor] = useState('#e74c3c');
    const scrollViewRef = useRef<ScrollView>(null);

    const handleAddTeam = () => {
        if (!teamName.trim()) {
            Alert.alert('Ошибка', 'Введите название команды');
            return;
        }

        if (!/^#[0-9A-F]{6}$/i.test(teamColor)) {
            Alert.alert('Ошибка', 'Неверный формат цвета. Используйте формат #RRGGBB');
            return;
        }

        addTeam.mutate({name: teamName.trim(), color: teamColor});
        setTeamName('');
        setTeamColor('#e74c3c');
        setEditingTeamId(null);
    };

    const handleEditTeam = (team: any) => {
        setEditingTeamId(team.id);
        setTeamName(team.name);
        setTeamColor(team.color);
    };

    const handleSaveEdit = () => {
        if (!teamName.trim()) {
            Alert.alert('Ошибка', 'Введите название команды');
            return;
        }

        if (!/^#[0-9A-F]{6}$/i.test(teamColor)) {
            Alert.alert('Ошибка', 'Неверный формат цвета. Используйте формат #RRGGBB');
            return;
        }

        updateTeam.mutate({teamId: editingTeamId!, updates: {name: teamName.trim(), color: teamColor}});
        setEditingTeamId(null);
        setTeamName('');
        setTeamColor('#e74c3c');
    };

    const handleDeleteTeam = (teamId: string, teamName: string) => {
        Alert.alert(
            'Удалить команду?',
            `Вы уверены, что хотите удалить команду "${teamName}"? Все игроки будут потеряны.`,
            [
                {text: 'Отмена', style: 'cancel'},
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () => deleteTeam.mutate(teamId),
                },
            ],
        );
    };

    const handleSetActiveTeam = (teamId: string) => {
        toggleActiveTeam.mutate(teamId);
        Alert.alert(
            'Успех',
            `Команда установлена как активная ${activeTeamsId?.includes(teamId) ? 'не' : ''} активная`,
        );
    };

    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: true, // плавная прокрутка
        });
    };

    return (
        <Container>
            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
                <Header>
                    <HeaderTitle>Настройки команды</HeaderTitle>
                    <IconButton color='secondary' iconType='plus' size={48} onPress={() => setEditingTeamId('new')} />
                </Header>

                {/* Форма добавления/редактирования команды */}
                {(editingTeamId === 'new' || editingTeamId) && (
                    <TeamForm>
                        <FormRow>
                            <FormLabel>Название команды</FormLabel>
                            <Input placeholder='Alpha Team' value={teamName} onChangeText={setTeamName} />
                        </FormRow>

                        <FormRow isLast={true}>
                            <FormLabel>Настроить цвет команды</FormLabel>
                            <ColorInput color={teamColor} setColor={(color) => setTeamColor(color)} />
                        </FormRow>

                        <Button
                            color='secondary'
                            text={editingTeamId === 'new' ? 'Добавить команду' : 'Сохранить изменения'}
                            onPress={editingTeamId === 'new' ? handleAddTeam : handleSaveEdit}
                        />

                        {editingTeamId !== 'new' && (
                            <TouchableOpacity
                                style={{alignItems: 'center', marginTop: 10}}
                                onPress={() => {
                                    setEditingTeamId(null);
                                    setTeamName('');
                                    setTeamColor('#e74c3c');
                                }}
                            >
                                <Text style={{color: '#3498db', fontSize: 16}}>Отменить</Text>
                            </TouchableOpacity>
                        )}
                    </TeamForm>
                )}

                <SectionTitle>Список команд</SectionTitle>

                {teams.length === 0 ? (
                    <EmptyState>
                        <TeamIcon color='inverse' size={56} />
                        <EmptyText>Нет команд. Добавьте первую команду выше.</EmptyText>
                    </EmptyState>
                ) : (
                    <TeamList>
                        <FlatList
                            data={teams}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <TeamItem
                                    handleDeleteTeam={() => handleDeleteTeam(item.id, item.name)}
                                    handleEditTeam={() => {
                                        handleEditTeam(item);
                                        scrollToTop();
                                    }}
                                    handleSetActiveTeam={() => handleSetActiveTeam(item.id)}
                                    isActive={!!activeTeamsId?.includes(item.id)}
                                    team={item}
                                />
                            )}
                        />
                    </TeamList>
                )}
            </ScrollView>
        </Container>
    );
};
