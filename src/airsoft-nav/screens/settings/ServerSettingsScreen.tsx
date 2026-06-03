// src/airsoft-nav/app/screens/settings/ServerSettingsScreen.tsx
import React, {useState, useEffect} from 'react';
import {View, Text, Switch, Alert, Linking, ScrollView} from 'react-native';
import styled from 'styled-components/native';

import {useServerSettings, useServerSettingsMutations} from '@src/airsoft-nav/app/hooks/useServerSettings';
import {useServerPlayers} from '@src/airsoft-nav/app/hooks/useServerPlayers';

const Container = styled.View`
    flex: 1;
    background-color: #1a1a1a;
`;

const Header = styled.View`
    padding: 20px;
    border-bottom-width: 1px;
    border-bottom-color: #2d2d2d;
`;

const HeaderTitle = styled.Text`
    color: #fff;
    font-size: 24px;
    font-weight: bold;
`;

const Section = styled.View`
    padding: 20px;
    border-bottom-width: 1px;
    border-bottom-color: #2d2d2d;
`;

const SectionTitle = styled.Text`
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
`;

const SectionSubtitle = styled.Text`
    color: #aaa;
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 20px;
`;

const FormRow = styled.View`
    margin-bottom: 20px;
`;

const FormLabel = styled.Text`
    color: #fff;
    font-size: 16px;
    margin-bottom: 8px;
    font-weight: 500;
`;

const FormInput = styled.TextInput`
    background-color: #2a2a2a;
    color: #fff;
    padding: 15px;
    border-radius: 10px;
    font-size: 16px;
`;

const SwitchRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
`;

const SwitchLabel = styled.Text<{demo?: boolean}>`
    color: ${(props) => (props.demo ? '#3498db' : '#fff')};
    font-size: 16px;
    font-weight: 500;
`;

const DemoBadge = styled.View`
    background-color: #3498db;
    padding: 3px 10px;
    border-radius: 12px;
    margin-left: 10px;
`;

const DemoBadgeText = styled.Text`
    color: #fff;
    font-size: 12px;
    font-weight: bold;
`;

const ContactButton = styled.TouchableOpacity`
    background-color: #e74c3c;
    padding: 18px;
    border-radius: 15px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 25px 0;
    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.3;
    shadow-radius: 8px;
    elevation: 5;
`;

const ContactText = styled.Text`
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    margin-left: 10px;
`;

const WarningBox = styled.View`
    background-color: #2c3e50;
    border-left-width: 4px;
    border-left-color: #f39c12;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
`;

const WarningTitle = styled.Text`
    color: #f39c12;
    font-weight: bold;
    margin-bottom: 5px;
`;

const WarningText = styled.Text`
    color: #ecf0f1;
    font-size: 14px;
    line-height: 20px;
`;

const FooterNote = styled.Text`
    color: #7f8c8d;
    font-size: 13px;
    text-align: center;
    margin-top: 30px;
    padding: 0 20px;
    line-height: 18px;
`;

const TouchableOpacity = styled.TouchableOpacity``;

export const ServerSettingsScreen = () => {
    const {data: settings, isLoading} = useServerSettings(); // ← Используем `data` из useQuery
    const {updateSettings, toggleDemoMode, resetToDefaults} = useServerSettingsMutations();
    const {connectionStatus, serverPlayers} = useServerPlayers();

    const statusLabel: Record<typeof connectionStatus, {text: string; color: string}> = {
        idle: {text: 'Не активно', color: '#7f8c8d'},
        connecting: {text: 'Подключение…', color: '#f39c12'},
        online: {text: `Онлайн · ${serverPlayers.length} игроков`, color: '#27ae60'},
        offline: {text: 'Нет связи', color: '#e74c3c'},
    };

    // Безопасная инициализация состояния
    const [host, setHost] = useState('192.168.10.1');
    const [port, setPort] = useState('8000');
    const [interval, setInterval] = useState('5000');

    // Обновляем состояние при получении настроек
    useEffect(() => {
        if (settings) {
            setHost(settings.host || '192.168.10.1');
            setPort(settings.port?.toString() || '8000');
            setInterval(settings.interval?.toString() || '5000');
        }
    }, [settings]);

    // Показываем загрузку пока настройки не получены
    if (isLoading && !settings) {
        return (
            <Container contentContainerStyle={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#fff', fontSize: 18}}>Загрузка настроек...</Text>
            </Container>
        );
    }

    const handleSave = () => {
        const portNum = parseInt(port) || 8000;
        const intervalNum = parseInt(interval) || 5000;

        if (portNum < 1 || portNum > 65535) {
            Alert.alert('Ошибка', 'Порт должен быть в диапазоне 1-65535');
            return;
        }
        if (intervalNum < 1000) {
            Alert.alert('Ошибка', 'Интервал должен быть не менее 1000 мс');
            return;
        }

        updateSettings.mutate({
            host,
            port: portNum,
            interval: intervalNum,
        });
        Alert.alert('Успех', 'Настройки сохранены');
    };

    const handleToggleDemo = (enabled: boolean) => {
        // eslint-disable-next-line no-negated-condition
        if (!enabled) {
            Alert.alert(
                'Выключить демо-режим?',
                'При отключении демо-режима все временные данные будут удалены. Для полноценной работы потребуется подключение к DMR хотспоту.',
                [
                    {text: 'Отмена', style: 'cancel'},
                    {
                        text: 'Выключить',
                        style: 'destructive',
                        onPress: () => toggleDemoMode.mutate(false),
                    },
                ],
            );
        } else {
            toggleDemoMode.mutate(true);
        }
    };

    const handleContact = () => {
        Alert.alert('Связаться с нами', 'Для приобретения переносного DMR хотспота свяжитесь с нами:', [
            {
                text: 'WhatsApp',
                onPress: () => Linking.openURL('https://wa.me/79991234567'),
            },
            {
                text: 'Telegram',
                onPress: () => Linking.openURL('https://t.me/airsoft_hotspot'),
            },
            {
                text: 'Сайт',
                onPress: () => Linking.openURL('https://airsoft-hotspot.ru'),
            },
            {text: 'Отмена', style: 'cancel'},
        ]);
    };

    const handleReset = () => {
        Alert.alert('Сбросить настройки?', 'Все настройки сервера будут сброшены к значениям по умолчанию.', [
            {text: 'Отмена', style: 'cancel'},
            {
                text: 'Сбросить',
                style: 'destructive',
                onPress: () => resetToDefaults.mutate(),
            },
        ]);
    };

    // Защита от отсутствия настроек
    if (!settings) {
        return (
            <Container contentContainerStyle={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#e74c3c', fontSize: 18, textAlign: 'center', padding: 20}}>
                    Ошибка загрузки настроек. Попробуйте перезапустить приложение.
                </Text>
            </Container>
        );
    }

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Header>
                    <HeaderTitle>Настройки сервера</HeaderTitle>
                </Header>

                {!settings.demoMode && (
                    <Section>
                        <WarningBox style={{borderLeftColor: '#e74c3c'}}>
                            <WarningTitle>❗ Требуется оборудование</WarningTitle>
                            <WarningText>
                                Для полноценной работы приложения необходим переносной DMR хотспот, который передаёт
                                GPS-координаты игроков в режиме реального времени.
                            </WarningText>
                        </WarningBox>

                        {/* <ContactButton onPress={handleContact}>
                            <Text style={{fontSize: 24}}>📱</Text>
                            <ContactText>Связаться для покупки хотспота</ContactText>
                        </ContactButton> */}

                        <FooterNote>
                            Хотспот совместим с радиостанциями, поддерживающими GPS и протоколы DMR.
                        </FooterNote>
                    </Section>
                )}

                {/* ДЕМО-РЕЖИМ */}
                <Section>
                    <SectionTitle>Демонстрация</SectionTitle>
                    <SectionSubtitle>
                        Включите для демонстрации возможностей приложения без подключения к реальному оборудованию. Все
                        данные генерируются случайным образом.
                    </SectionSubtitle>

                    <SwitchRow>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <SwitchLabel demo>Демонстрация</SwitchLabel>
                            {settings.demoMode && (
                                <DemoBadge>
                                    <DemoBadgeText>АКТИВЕН</DemoBadgeText>
                                </DemoBadge>
                            )}
                        </View>
                        <Switch
                            thumbColor={settings.demoMode ? '#fff' : '#f4f3f4'}
                            trackColor={{false: '#767577', true: '#3498db'}}
                            value={settings.demoMode || false}
                            onValueChange={handleToggleDemo}
                        />
                    </SwitchRow>

                    {settings.demoMode && (
                        <WarningBox>
                            <WarningTitle>ℹ️ Режим демонстрации</WarningTitle>
                            <WarningText>
                                Все данные игроков генерируются случайным образом. Координаты обновляются каждые 2
                                секунды для демонстрации движения. Для реальной игры требуется DMR хотспот.
                            </WarningText>
                        </WarningBox>
                    )}
                </Section>

                {/* РЕАЛЬНЫЙ РЕЖИМ */}
                <Section>
                    <SectionTitle>Подключение к хотспоту</SectionTitle>
                    <SectionSubtitle>
                        Настройки для подключения к переносному DMR хотспоту. Убедитесь, что телефон подключён к Wi-Fi
                        сети хотспота.
                    </SectionSubtitle>

                    <FormRow>
                        <FormLabel>IP адрес хотспота</FormLabel>
                        <FormInput
                            selectTextOnFocus
                            editable={!settings.demoMode}
                            placeholder='192.168.10.1'
                            value={host}
                            onChangeText={setHost}
                        />
                    </FormRow>

                    <FormRow>
                        <FormLabel>Порт</FormLabel>
                        <FormInput
                            selectTextOnFocus
                            editable={!settings.demoMode}
                            keyboardType='numeric'
                            placeholder='8000'
                            value={port}
                            onChangeText={(text) => {
                                // Разрешаем только цифры
                                const cleaned = text.replace(/[^0-9]/g, '');
                                setPort(cleaned);
                            }}
                        />
                    </FormRow>

                    <FormRow>
                        <FormLabel>Интервал обновления (мс)</FormLabel>
                        <FormInput
                            selectTextOnFocus
                            editable={!settings.demoMode}
                            keyboardType='numeric'
                            placeholder='5000'
                            value={interval}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '');
                                setInterval(cleaned);
                            }}
                        />
                    </FormRow>

                    <SwitchRow>
                        <SwitchLabel>Включить синхронизацию</SwitchLabel>
                        <Switch
                            disabled={settings.demoMode}
                            thumbColor={settings.enabled || settings.demoMode ? '#fff' : '#f4f3f4'}
                            trackColor={{false: '#767577', true: '#27ae60'}}
                            value={settings.enabled || false}
                            onValueChange={(value) => updateSettings.mutate({enabled: value})}
                        />
                    </SwitchRow>

                    {!settings.demoMode && (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                            }}
                        >
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: statusLabel[connectionStatus].color,
                                    marginRight: 10,
                                }}
                            />
                            <Text style={{color: statusLabel[connectionStatus].color, fontSize: 14}}>
                                {statusLabel[connectionStatus].text}
                            </Text>
                        </View>
                    )}

                    {settings.demoMode && (
                        <Text style={{color: '#3498db', fontSize: 13, marginTop: 10, fontStyle: 'italic'}}>
                            ⚠️ В демо-режиме синхронизация всегда включена и не может быть отключена
                        </Text>
                    )}
                </Section>

                {/* ДЕЙСТВИЯ */}
                <Section>
                    <SwitchRow>
                        <SwitchLabel>Сбросить настройки</SwitchLabel>
                        <TouchableOpacity onPress={handleReset}>
                            <Text style={{color: '#e74c3c', fontSize: 16, fontWeight: 'bold'}}>Сбросить</Text>
                        </TouchableOpacity>
                    </SwitchRow>
                </Section>
            </ScrollView>
        </Container>
    );
};
