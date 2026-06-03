import React, {useState} from 'react';
import styled from 'styled-components/native';
import {Alert, Modal} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Team} from '@src/airsoft-nav/types/airsoft';
import {useActiveTeams, useTeamMutations} from '@src/airsoft-nav/app/hooks/useTeams';
import {PencilIcon} from '@src/airsoft-nav/ui/icons/PencilIcon';
import {TrashIcon} from '@src/airsoft-nav/ui/icons/TrashIcon';
import {Button} from '@src/airsoft-nav/ui/controls/Button';

const TeamCardContainer = styled.View<{isActive: boolean}>`
    background-color: #2c2c2c;
    border-radius: 15px;
    padding: 15px;
    margin-bottom: 15px;
    border-width: ${(props) => (props.isActive ? '2px' : '0px')};
    border-color: #e74c3c;
`;

const TeamHeader = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding-bottom: 10px;
    border-bottom-width: 1px;
    border-bottom-color: #3a3a3a;
    margin-bottom: 10px;
`;

const TeamBadge = styled.View<{color: string}>`
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background-color: ${(props) => props.color};
    align-items: center;
    justify-content: center;
    margin-right: 15px;
`;

const TeamBadgeText = styled.Text`
    color: #fff;
    font-size: 24px;
    font-weight: bold;
`;

const TeamInfo = styled.View`
    flex: 1;
`;

const TeamName = styled.Text`
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
`;

const TeamPlayers = styled.Text`
    color: #aaa;
    font-size: 14px;
`;

const ActiveIndicator = styled.View`
    background-color: #27ae60;
    width: 30px;
    height: 30px;
    border-radius: 15px;
    align-items: center;
    justify-content: center;
`;

const ActiveIndicatorText = styled.Text`
    color: #fff;
    font-size: 18px;
`;

const PlayersList = styled.View`
    margin-top: 10px;
    margin-bottom: 20px;
`;

const PlayerItem = styled.View`
    background-color: #3a3a3a;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 8px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const PlayerInfo = styled.View`
    flex: 1;
    justify-content: center;
`;

const PlayerName = styled.Text<{eliminated: boolean}>`
    color: ${(props) => (props.eliminated ? '#e74c3c' : '#fff')};
    font-size: 16px;
    font-weight: bold;
`;

const PlayerDetails = styled.Text`
    color: #aaa;
    font-size: 12px;
`;

const PlayerActions = styled.View`
    flex-direction: row;
    gap: 8px;
`;

const ActionButton = styled.TouchableOpacity`
    width: 44px;
    height: 44px;
    justify-content: center;
    align-items: center;
`;

const ConfirmModal = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
`;

const ConfirmContent = styled.View`
    background-color: #2c2c2c;
    border-radius: 15px;
    padding: 25px;
    width: 85%;
`;

const ConfirmTitle = styled.Text`
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
`;

const ConfirmMessage = styled.Text`
    color: #aaa;
    font-size: 16px;
    text-align: center;
    margin-bottom: 25px;
`;

const ConfirmButtons = styled.View`
    flex-direction: row;
    justify-content: space-between;
    gap: 15px;
`;

const ConfirmButton = styled.TouchableOpacity<{danger?: boolean}>`
    flex: 1;
    background-color: ${(props) => (props.danger ? '#e74c3c' : '#3498db')};
    padding: 15px;
    border-radius: 10px;
    align-items: center;
`;

const ConfirmButtonText = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: bold;
`;
interface Props {
    team: Team;
}

export const TeamCard: React.FC<Props> = ({team}) => {
    const navigation = useNavigation<any>();
    const {data: activeTeamIds = []} = useActiveTeams();
    const {toggleActiveTeam, deletePlayer} = useTeamMutations();
    const handleDeletePlayerConfirm = (playerId: string, playerName: string) => {
        setConfirmDelete({playerId, playerName});
    };
    const [confirmDelete, setConfirmDelete] = useState<{playerId: string; playerName: string} | null>(null);

    const handleTeamPress = (teamId: string) => {
        toggleActiveTeam.mutate(teamId);
        Alert.alert('Команда выбрана', 'Теперь эта команда активна на карте');
    };
    const handleAddPlayer = (teamId: string) => {
        navigation.navigate('PlayerDetail', {teamId});
    };

    const handleEditPlayer = (teamId: string, playerId: string) => {
        navigation.navigate('PlayerDetail', {teamId, playerId});
    };

    const handleDeletePlayer = () => {
        if (confirmDelete) {
            deletePlayer.mutate(confirmDelete.playerId);
            setConfirmDelete(null);
            Alert.alert('Успех', `Игрок "${confirmDelete.playerName}" удален`);
        }
    };

    return (
        <>
            <TeamCardContainer isActive={activeTeamIds.includes(team.id)}>
                <TeamHeader onPress={() => handleTeamPress(team.id)}>
                    <TeamBadge color={team.color}>
                        <TeamBadgeText>{team.name.charAt(0)}</TeamBadgeText>
                    </TeamBadge>
                    <TeamInfo>
                        <TeamName>{team.name}</TeamName>
                        <TeamPlayers>Игроков: {team.players.length}</TeamPlayers>
                    </TeamInfo>
                    {activeTeamIds.includes(team.id) && (
                        <ActiveIndicator>
                            <ActiveIndicatorText>✓</ActiveIndicatorText>
                        </ActiveIndicator>
                    )}
                </TeamHeader>

                {team.players.length > 0 && (
                    <PlayersList>
                        {team.players.map((player) => (
                            <PlayerItem key={player.id}>
                                <PlayerInfo>
                                    <PlayerName eliminated={player.status === 'eliminated'}>
                                        {player.callsign}
                                    </PlayerName>
                                    <PlayerDetails>
                                        {player.role && `${player.role} • `}
                                        {player.status === 'eliminated' && ' • Выбыл'}
                                    </PlayerDetails>
                                </PlayerInfo>
                                <PlayerActions>
                                    <ActionButton onPress={() => handleEditPlayer(team.id, player.id)}>
                                        <PencilIcon color='inverse' />
                                    </ActionButton>
                                    <ActionButton onPress={() => handleDeletePlayerConfirm(player.id, player.callsign)}>
                                        <TrashIcon color='inverse' />
                                    </ActionButton>
                                </PlayerActions>
                            </PlayerItem>
                        ))}
                    </PlayersList>
                )}
                <Button color='secondary' text='➕ Добавить игрока' onPress={() => handleAddPlayer(team.id)} />
            </TeamCardContainer>

            {/* Модальное окно подтверждения удаления */}
            <Modal
                animationType='fade'
                transparent={true}
                visible={!!confirmDelete}
                onRequestClose={() => setConfirmDelete(null)}
            >
                <ConfirmModal>
                    <ConfirmContent>
                        <ConfirmTitle>Удалить игрока?</ConfirmTitle>
                        <ConfirmMessage>
                            Вы уверены, что хотите удалить игрока "{confirmDelete?.playerName}"? Это действие нельзя
                            отменить.
                        </ConfirmMessage>
                        <ConfirmButtons>
                            <ConfirmButton onPress={() => setConfirmDelete(null)}>
                                <ConfirmButtonText>Отмена</ConfirmButtonText>
                            </ConfirmButton>
                            <ConfirmButton danger onPress={handleDeletePlayer}>
                                <ConfirmButtonText>Удалить</ConfirmButtonText>
                            </ConfirmButton>
                        </ConfirmButtons>
                    </ConfirmContent>
                </ConfirmModal>
            </Modal>
        </>
    );
};
