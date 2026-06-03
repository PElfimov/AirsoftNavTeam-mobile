// src/airsoft-nav/app/screens/team/PlayerDetailScreen.tsx
import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {
    TouchableOpacity,
    Alert,
    View,
    Text,
    Modal,
    FlatList,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';

import {useTeamMutations, useTeams} from '@src/airsoft-nav/app/hooks/useTeams';
import {useServerPlayers} from '@src/airsoft-nav/app/hooks/useServerPlayers';

const Container = styled.View`
    flex: 1;
    background-color: #1a1a1a;
    padding: 20px;
`;

const Header = styled.View`
    margin-bottom: 30px;
`;

const HeaderTitle = styled.Text`
    color: #fff;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
`;

const FormSection = styled.View`
    background-color: #2c2c2c;
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 25px;
`;

const FormLabel = styled.Text`
    color: #aaa;
    font-size: 14px;
    margin-bottom: 8px;
    margin-left: 5px;
`;

const FormInput = styled.TextInput`
    background-color: #3a3a3a;
    border-radius: 10px;
    padding: 15px;
    color: #fff;
    font-size: 16px;
    margin-bottom: 15px;
`;

const ServerIdContainer = styled.View`
    background-color: #3a3a3a;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
`;

const ServerIdDisplay = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const ServerIdText = styled.Text`
    color: #3498db;
    font-size: 16px;
    flex: 1;
`;

const ServerIdButton = styled.TouchableOpacity`
    background-color: #3498db;
    padding-horizontal: 12px;
    padding-vertical: 6px;
    border-radius: 8px;
    margin-left: 10px;
`;

const ServerIdButtonText = styled.Text`
    color: #fff;
    font-size: 14px;
    font-weight: bold;
`;

const StatusRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 20px;
`;

const StatusOption = styled.TouchableOpacity<{active: boolean; color: string}>`
    flex: 1;
    align-items: center;
    padding: 12px;
    border-radius: 10px;
    background-color: ${(props) => (props.active ? props.color : '#3a3a3a')};
    margin-horizontal: 5px;
`;

const StatusText = styled.Text<{active: boolean}>`
    color: ${(props) => (props.active ? '#fff' : '#aaa')};
    font-size: 14px;
    font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
    margin-top: 5px;
`;

const SaveButton = styled.TouchableOpacity<{disabled?: boolean}>`
    background-color: ${(props) => (props.disabled ? '#95a5a6' : '#27ae60')};
    border-radius: 12px;
    padding: 18px;
    align-items: center;
    margin-top: 10px;
    opacity: ${(props) => (props.disabled ? 0.6 : 1)};
`;

const SaveButtonText = styled.Text`
    color: #fff;
    font-size: 18px;
    font-weight: bold;
`;

const DeleteButton = styled.TouchableOpacity`
    background-color: #e74c3c;
    border-radius: 12px;
    padding: 15px;
    align-items: center;
    margin-top: 15px;
`;

const DeleteButtonText = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: bold;
`;

// Модальное окно выбора серверного игрока
const ServerPlayerModal = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.View`
    background-color: #2c2c2c;
    border-radius: 15px;
    padding: 20px;
    width: 90%;
    max-height: 70%;
`;

const ModalHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const ModalTitle = styled.Text`
    color: #fff;
    font-size: 20px;
    font-weight: bold;
`;

const CloseButton = styled.Text`
    color: #e74c3c;
    font-size: 28px;
    font-weight: bold;
`;

const EmptyList = styled.View`
    align-items: center;
    justify-content: center;
    padding: 40px;
`;

const EmptyText = styled.Text`
    color: #aaa;
    font-size: 16px;
    text-align: center;
    margin-top: 10px;
`;

const ServerPlayerItem = styled.TouchableOpacity<{isSelected: boolean}>`
    background-color: ${(props) => (props.isSelected ? '#3498db20' : '#3a3a3a')};
    border-left-width: 4px;
    border-left-color: ${(props) => (props.isSelected ? '#3498db' : 'transparent')};
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 10px;
`;

const ServerPlayerInfo = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
`;

const ServerPlayerId = styled.Text`
    color: #3498db;
    font-size: 14px;
    flex: 1;
`;

const ServerPlayerBattery = styled.Text<{low: boolean}>`
    color: ${(props) => (props.low ? '#e74c3c' : '#27ae60')};
    font-size: 14px;
    font-weight: bold;
    margin-left: 10px;
`;

const ServerPlayerCoords = styled.Text`
    color: #aaa;
    font-size: 12px;
    margin-top: 5px;
`;

export const PlayerDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const {teamId, playerId} = route.params || {};
    const {data: teams = []} = useTeams();
    const {addPlayer, updatePlayer, deletePlayer} = useTeamMutations();
    const {serverPlayers, enabled: isServerEnabled} = useServerPlayers();

    const [selectedTeamId, setSelectedTeamId] = useState(teamId || '');
    const [callsign, setCallsign] = useState('');
    const [role, setRole] = useState('');
    const [battery, setBattery] = useState('100');
    const [status, setStatus] = useState<'active' | 'eliminated' | 'spectator'>('active');
    const [serverId, setServerId] = useState<string>('');
    const [showServerModal, setShowServerModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const selectedTeam = teams.find((t) => t.id === selectedTeamId);
    const player = selectedTeam?.players.find((p) => p.id === playerId);

    useEffect(() => {
        if (player) {
            setCallsign(player.callsign);
            setRole(player.role || '');
            setBattery(player.battery?.toString() || '100');
            setStatus(player.status);
            setServerId(player.serverId || '');
        }
    }, [player]);

    const handleSave = async () => {
        if (!callsign.trim()) {
            Alert.alert('Ошибка', 'Введите позывной игрока');
            return;
        }
        if (!selectedTeamId) {
            Alert.alert('Ошибка', 'Выберите команду');
            return;
        }
        if (!serverId) {
            Alert.alert('Ошибка', 'Выберите Server ID');
            return;
        }

        setLoading(true);

        // Если выбран серверный игрок, получаем его текущие данные
        let coordinates;
        let serverBattery;
        let serverStatus: 'active' | 'eliminated' | 'spectator' = status;

        if (serverId) {
            const serverPlayer = serverPlayers.find((p) => p.id === serverId);
            if (serverPlayer) {
                coordinates = {
                    latitude: serverPlayer.latitude,
                    longitude: serverPlayer.longitude,
                };
                serverBattery = serverPlayer.battery;
                serverStatus = serverPlayer.status || status;
            }
        }

        const batteryNum = serverBattery !== undefined ? serverBattery : parseInt(battery) || 100;
        const finalStatus = serverId ? serverStatus : status;

        const playerData = {
            callsign: callsign.trim(),
            teamId,
            serverId: serverId || undefined,
            role: role.trim() || undefined,
            battery: batteryNum,
            status: finalStatus,
            coordinates,
            timestamp: Date.now(),
        };

        try {
            if (playerId) {
                // Обновление существующего игрока
                await updatePlayer.mutateAsync({playerId, updates: playerData});
                Alert.alert('Успех', 'Игрок обновлен');
            } else {
                // Добавление нового игрока
                await addPlayer.mutateAsync(playerData);
                Alert.alert('Успех', 'Игрок добавлен');
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось сохранить игрока');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!playerId) {
            return;
        }
        Alert.alert('Удалить игрока?', `Вы уверены, что хотите удалить игрока "${player?.callsign}"?`, [
            {text: 'Отмена', style: 'cancel'},
            {
                text: 'Удалить',
                style: 'destructive',
                onPress: () => {
                    deletePlayer.mutate(playerId);
                    navigation.goBack();
                },
            },
        ]);
    };

    const handleSelectServerPlayer = (serverPlayerId: string) => {
        setServerId(serverPlayerId);
        setShowServerModal(false);
    };

    const handleClearServerId = () => {
        setServerId('');
    };

    // Фильтрация доступных серверных игроков (исключаем уже привязанных)
    const availableServerPlayers = serverPlayers.filter((serverPlayer) => {
        // Если редактируем игрока и его текущий serverId совпадает — показываем (можно оставить как есть)
        if (player?.serverId === serverPlayer.id) {
            return true;
        }
        // Проверяем, не привязан ли этот серверный игрок к ДРУГОМУ локальному игроку
        const isAlreadyUsed = teams.some((team) =>
            team.players.some(
                (p) => p.id !== playerId && p.serverId === serverPlayer.id, // исключаем текущего игрока
            ),
        );
        return !isAlreadyUsed;
    });

    if (teams.length === 0) {
        return (
            <Container>
                <Header>
                    <HeaderTitle>{playerId ? 'Редактировать игрока' : 'Новый игрок'}</HeaderTitle>
                </Header>
                <View style={{alignItems: 'center', marginTop: 50}}>
                    <Text style={{color: '#e74c3c', fontSize: 18, textAlign: 'center'}}>
                        Нет команд. Сначала создайте команду в разделе "Настройки команд".
                    </Text>
                    <TouchableOpacity
                        style={{marginTop: 20, padding: 15, backgroundColor: '#3498db', borderRadius: 10}}
                        onPress={() => navigation.navigate('TeamSettings')}
                    >
                        <Text style={{color: '#fff', fontSize: 16}}>Создать команду</Text>
                    </TouchableOpacity>
                </View>
            </Container>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior='padding'
            keyboardVerticalOffset={80}
            style={{flex: 1, backgroundColor: '#1a1a1a'}}
        >
            <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
                <Header>
                    <HeaderTitle>{playerId ? 'Редактировать игрока' : 'Новый игрок'}</HeaderTitle>
                </Header>

                <FormSection>
                    {/* Выбор команды */}
                    <FormLabel>Команда *</FormLabel>
                    <View
                        style={{
                            backgroundColor: '#3a3a3a',
                            borderRadius: 10,
                            height: 50,
                            justifyContent: 'center', // Центрируем текст по вертикали
                            overflow: 'hidden',
                            marginBottom: 15,
                        }}
                    >
                        <Picker
                            dropdownIconColor='#fff'
                            selectedValue={selectedTeamId}
                            style={{
                                color: '#fff',
                                fontSize: 16,
                                width: '100%',
                            }}
                            onValueChange={(value) => {
                                setSelectedTeamId(value);
                                // При смене команды сбрасываем привязку к серверу
                                if (playerId) {
                                    setServerId('');
                                }
                            }}
                        >
                            <Picker.Item color='#aaa' label='Выберите команду...' value='' />
                            {teams.map((team) => (
                                <Picker.Item
                                    key={team.id}
                                    color='#fff'
                                    label={`${team.name} (${team.players.length} игроков)`}
                                    value={team.id}
                                />
                            ))}
                        </Picker>
                    </View>
                    <FormLabel>Позывной *</FormLabel>
                    <FormInput
                        autoCapitalize='words'
                        editable={!loading}
                        placeholder='Snake, Eagle, Ghost...'
                        placeholderTextColor='#aaa'
                        value={callsign}
                        onChangeText={setCallsign}
                    />

                    <FormLabel>Роль (опционально)</FormLabel>
                    <FormInput
                        autoCapitalize='words'
                        editable={!loading}
                        placeholder='Командир, Снайпер, Медик...'
                        placeholderTextColor='#aaa'
                        value={role}
                        onChangeText={setRole}
                    />

                    <FormLabel>Server ID (для синхронизации) *</FormLabel>
                    <ServerIdContainer>
                        <ServerIdDisplay>
                            {serverId ? (
                                <>
                                    <ServerIdText>{serverId}</ServerIdText>
                                    <ServerIdButton onPress={handleClearServerId}>
                                        <ServerIdButtonText>×</ServerIdButtonText>
                                    </ServerIdButton>
                                </>
                            ) : (
                                <ServerIdText style={{color: '#aaa', fontStyle: 'italic'}}>Не выбрано</ServerIdText>
                            )}
                        </ServerIdDisplay>
                        <TouchableOpacity
                            style={{marginTop: 10, alignItems: 'center'}}
                            onPress={() => {
                                return isServerEnabled
                                    ? setShowServerModal(true)
                                    : navigation.navigate('Settings', {
                                          screen: 'ServerSettings',
                                      });
                            }}
                        >
                            <Text
                                style={{
                                    color: isServerEnabled ? '#3498db' : '#526566',
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                }}
                            >
                                {isServerEnabled ? 'Выбрать из сервера' : 'Включите синхронизацию'}
                            </Text>
                        </TouchableOpacity>
                    </ServerIdContainer>

                    {!serverId && (
                        <>
                            <FormLabel>Заряд батареи (%)</FormLabel>
                            <FormInput
                                editable={!loading}
                                keyboardType='numeric'
                                placeholder='100'
                                placeholderTextColor='#aaa'
                                value={battery}
                                onChangeText={(text) => {
                                    const num = text.replace(/[^0-9]/g, '');
                                    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 100)) {
                                        setBattery(num);
                                    }
                                }}
                            />
                        </>
                    )}

                    <FormLabel>Статус</FormLabel>
                    <StatusRow>
                        <StatusOption active={status === 'active'} color='#27ae60' onPress={() => setStatus('active')}>
                            <Text style={{fontSize: 24, color: status === 'active' ? '#fff' : '#27ae60'}}>✓</Text>
                            <StatusText active={status === 'active'}>Активен</StatusText>
                        </StatusOption>
                        <StatusOption
                            active={status === 'eliminated'}
                            color='#e74c3c'
                            onPress={() => setStatus('eliminated')}
                        >
                            <Text style={{fontSize: 24, color: status === 'eliminated' ? '#fff' : '#e74c3c'}}>✗</Text>
                            <StatusText active={status === 'eliminated'}>Выбыл</StatusText>
                        </StatusOption>
                        <StatusOption
                            active={status === 'spectator'}
                            color='#3498db'
                            onPress={() => setStatus('spectator')}
                        >
                            <Text style={{fontSize: 24, color: status === 'spectator' ? '#fff' : '#3498db'}}>👁️</Text>
                            <StatusText active={status === 'spectator'}>Наблюдатель</StatusText>
                        </StatusOption>
                    </StatusRow>
                </FormSection>

                <SaveButton disabled={loading} onPress={handleSave}>
                    <SaveButtonText>
                        {loading ? 'Сохранение...' : playerId ? 'Сохранить' : 'Добавить игрока'}
                    </SaveButtonText>
                </SaveButton>

                {playerId && (
                    <DeleteButton disabled={loading} onPress={handleDelete}>
                        <DeleteButtonText>Удалить игрока</DeleteButtonText>
                    </DeleteButton>
                )}

                {/* Модальное окно выбора серверного игрока */}
                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={showServerModal}
                    onRequestClose={() => setShowServerModal(false)}
                >
                    <ServerPlayerModal>
                        <ModalContent>
                            <ModalHeader>
                                <ModalTitle>Выберите игрока с сервера</ModalTitle>
                                <TouchableOpacity onPress={() => setShowServerModal(false)}>
                                    <CloseButton>✕</CloseButton>
                                </TouchableOpacity>
                            </ModalHeader>
                            {/* Подсказка о занятых серверных игроках */}
                            {serverPlayers.length > availableServerPlayers.length && (
                                <View
                                    style={{
                                        backgroundColor: '#34495e',
                                        padding: 12,
                                        borderRadius: 8,
                                        marginBottom: 15,
                                    }}
                                >
                                    <Text style={{color: '#3498db', fontSize: 13, textAlign: 'center'}}>
                                        {serverPlayers.length - availableServerPlayers.length} игроков уже привязаны к
                                        другим участникам
                                    </Text>
                                </View>
                            )}
                            {availableServerPlayers.length === 0 ? (
                                <EmptyList>
                                    <Text style={{color: '#fff', fontSize: 48}}>📡</Text>
                                    <EmptyText>
                                        Нет данных с сервера. Проверьте настройки подключения в разделе "Настройки
                                        сервера".
                                    </EmptyText>
                                </EmptyList>
                            ) : (
                                <FlatList
                                    ListEmptyComponent={
                                        <EmptyList>
                                            <ActivityIndicator color='#3498db' size='large' />
                                            <EmptyText style={{marginTop: 20}}>Загрузка игроков...</EmptyText>
                                        </EmptyList>
                                    }
                                    data={serverPlayers}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({item}) => {
                                        const isSelected = serverId === item.id;
                                        // Проверка: уже привязан ли к другому игроку (для визуальной индикации)
                                        const isBoundToOther = teams.some((team) =>
                                            team.players.some((p) => p.id !== playerId && p.serverId === item.id),
                                        );
                                        return (
                                            <ServerPlayerItem
                                                isSelected={isSelected}
                                                style={{opacity: isBoundToOther ? 0.5 : 1}}
                                                onPress={() => !isBoundToOther && handleSelectServerPlayer(item.id)}
                                            >
                                                <ServerPlayerInfo>
                                                    <ServerPlayerId>{item.id}</ServerPlayerId>
                                                    <ServerPlayerBattery low={(item.battery || 0) < 30}>
                                                        🔋 {item.battery}%
                                                    </ServerPlayerBattery>
                                                </ServerPlayerInfo>
                                                <ServerPlayerCoords>
                                                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                                </ServerPlayerCoords>
                                                {/* Индикатор если уже привязан к другому игроку */}
                                                {isBoundToOther && (
                                                    <View
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: 5,
                                                            right: 5,
                                                            backgroundColor: '#e74c3c',
                                                            borderRadius: 10,
                                                            padding: 3,
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: '#fff',
                                                                fontSize: 10,
                                                                fontWeight: 'bold',
                                                            }}
                                                        >
                                                            ЗАНЯТ
                                                        </Text>
                                                    </View>
                                                )}
                                            </ServerPlayerItem>
                                        );
                                    }}
                                />
                            )}

                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#e74c3c',
                                    padding: 15,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    marginTop: 20,
                                }}
                                onPress={() => setShowServerModal(false)}
                            >
                                <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>Закрыть</Text>
                            </TouchableOpacity>
                        </ModalContent>
                    </ServerPlayerModal>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
