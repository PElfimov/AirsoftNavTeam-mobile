import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';

import {Team} from '@src/airsoft-nav/types/airsoft';
import {PlusIcon} from '@src/airsoft-nav/ui/icons/PlusIcon';
import {PencilIcon} from '@src/airsoft-nav/ui/icons/PencilIcon';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';
import {TrashIcon} from '@src/airsoft-nav/ui/icons/TrashIcon';

const Container = styled.TouchableOpacity<{isActive: boolean}>`
    background-color: ${COLORS.primary};
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 10px;
    flex-direction: row;
    align-items: center;
    border-left-width: 4px;
    border-left-color: ${(props) => (props.isActive ? COLORS.positive : COLORS.primary)};
    justify-content: space-between;
`;

const TemView = styled.View`
    flex-direction: row;
    align-items: center;
`;
const TeamColorBadge = styled.View<{color: string}>`
    width: 44px;
    height: 44px;
    border-radius: 44px;
    background-color: ${(props) => props.color};
    margin-right: 15px;
    justify-content: center;
`;

const TeamNameText = styled.Text`
    color: ${COLORS.contrast};
    font-size: 18px;
    font-weight: bold;
    flex: 1;
    width: 80px;
`;

const TeamWord = styled.Text`
    color: ${COLORS.contrast};
    font-size: 24px;
    font-weight: bold;
    text-align: center;
`;

const PlayerCountText = styled.Text`
    color: ${COLORS.inverse};
    font-size: 15px;
    margin-top: 3px;
`;

const ActionButton = styled.TouchableOpacity`
    height: 44px;
    width: 44px;
    align-items: center;
    justify-content: center;
`;

const ButtonContainer = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    width: 50%;
    margin-left: 15px;
    align-items: end;
`;

interface Props {
    team: Team;
    isActive: boolean;
    handleEditTeam: () => void;
    handleSetActiveTeam: () => void;
    handleDeleteTeam: () => void;
}

export const TeamItem: React.FC<Props> = ({team, handleEditTeam, handleSetActiveTeam, isActive, handleDeleteTeam}) => {
    const navigation = useNavigation<any>();
    const handleAddPlayer = (teamId: string) => {
        navigation.navigate('PlayerDetail', {teamId});
    };
    return (
        <Container isActive={isActive} onLongPress={handleEditTeam} onPress={handleSetActiveTeam}>
            <TemView>
                <TeamColorBadge color={team.color}>
                    <TeamWord>{team.name[0]}</TeamWord>
                </TeamColorBadge>
                <View>
                    <TeamNameText ellipsizeMode='tail' numberOfLines={1}>
                        {team.name}
                    </TeamNameText>
                    <PlayerCountText>Игроков: {team.players.length}</PlayerCountText>
                </View>
            </TemView>
            <ButtonContainer>
                <ActionButton onPress={() => handleAddPlayer(team.id)}>
                    <PlusIcon color='inverse' />
                </ActionButton>
                <ActionButton onPress={handleEditTeam}>
                    <PencilIcon color='inverse' />
                </ActionButton>
                <ActionButton onPress={handleDeleteTeam}>
                    <TrashIcon color='inverse' />
                </ActionButton>
            </ButtonContainer>
        </Container>
    );
};
