// src/airsoft-nav/app/screens/team/TeamScreen.tsx
import React, {FC} from 'react';
import styled from 'styled-components/native';
import {FlatList, SafeAreaView} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTeams} from '@src/airsoft-nav/app/hooks/useTeams';
import {TeamIcon} from '@src/airsoft-nav/ui/icons/TeamIcon';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';
import {IconButton} from '@src/airsoft-nav/ui/controls/IconButton';
import {TeamCard} from './components/TeamCard';

const Container = styled.View`
    flex: 1;
    background-color: #1a1a1a;
    padding: 20px;
`;

const Header = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const HeaderTitle = styled.Text`
    color: ${COLORS.contrast};
    font-size: 22px;
    font-weight: bold;
`;

const EmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const EmptyText = styled.Text`
    color: #aaa;
    font-size: 16px;
    text-align: center;
    margin-top: 20;
`;

export const TeamScreen: FC = () => {
    const navigation = useNavigation<any>();
    const {data: teams = []} = useTeams();

    const handleAddTeam = () => {
        navigation.navigate('TeamSettings');
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <Container>
                <Header>
                    <HeaderTitle>Настройка команд</HeaderTitle>
                    <IconButton color='secondary' iconType='settings' size={48} onPress={handleAddTeam} />
                </Header>

                <FlatList
                    ListEmptyComponent={
                        <EmptyContainer>
                            <TeamIcon color='inverse' size={56} />
                            <EmptyText>У вас нет команд. Добавьте первую в настройках выше</EmptyText>
                        </EmptyContainer>
                    }
                    contentContainerStyle={{flexGrow: 1}}
                    data={teams}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => <TeamCard team={item} />}
                />
            </Container>
        </SafeAreaView>
    );
};
