import React, {FC, useState} from 'react';
import {Alert, FlatList, Text, TouchableOpacity, View} from 'react-native';
import {pick, keepLocalCopy, errorCodes, isErrorWithCode} from '@react-native-documents/picker';
import styled from 'styled-components/native';

import {Button} from '@src/airsoft-nav/ui/controls/Button';
import {useKMZLayers, useMapSettings, useMapSettingsMutations} from '@src/airsoft-nav/app/hooks/useMapSettings';
import {importKMZFile, deleteKMZImage} from '@src/airsoft-nav/app/utils/kmzImport';
import {KMZLayer} from '@src/airsoft-nav/types/airsoft';

const Container = styled.View`
    flex: 1;
    background-color: #1a1a1a;
    padding: 20px;
`;

const TopBar = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const GlobalToggleRow = styled.TouchableOpacity`
    background-color: #2c2c2c;
    border-radius: 12px;
    padding: 12px 16px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const LayerCard = styled.View`
    background-color: #2c2c2c;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
`;

const CardHeader = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const LayerName = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    flex: 1;
    margin-right: 8px;
`;

const LayerMeta = styled.Text`
    color: #aaa;
    font-size: 12px;
    margin-bottom: 10px;
`;

const ActionsRow = styled.View`
    flex-direction: row;
    gap: 8px;
`;

const ActionButton = styled.TouchableOpacity<{tone?: 'danger' | 'neutral'}>`
    background-color: ${(props) => (props.tone === 'danger' ? '#7a2a2a' : '#3a3a3a')};
    padding: 8px 14px;
    border-radius: 8px;
`;

const ActionText = styled.Text`
    color: #fff;
    font-size: 14px;
`;

const EmptyState = styled.View`
    align-items: center;
    margin-top: 40px;
`;

const EmptyText = styled.Text`
    color: #aaa;
    font-size: 14px;
    text-align: center;
    margin-bottom: 16px;
`;

const OpacityRow = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
`;

const OpacityLabel = styled.Text`
    color: #aaa;
    font-size: 12px;
    margin-right: 10px;
    width: 70px;
`;

const OpacityStep = styled.TouchableOpacity<{active?: boolean}>`
    background-color: ${(props) => (props.active ? '#e74c3c' : '#3a3a3a')};
    padding: 6px 10px;
    border-radius: 6px;
    margin-right: 6px;
`;

const OpacityStepText = styled.Text`
    color: #fff;
    font-size: 12px;
`;

const OPACITY_STEPS = [0.25, 0.5, 0.75, 1];

const formatBounds = (b: KMZLayer['bounds']): string =>
    `${b.south.toFixed(4)}…${b.north.toFixed(4)}, ${b.west.toFixed(4)}…${b.east.toFixed(4)}`;

export const KMZLayersScreen: FC = () => {
    const {data: layers = []} = useKMZLayers();
    const {data: mapSettings} = useMapSettings();
    const {addKMZLayer, updateKMZLayer, deleteKMZLayer, setShowKMZLayers} = useMapSettingsMutations();
    const [importing, setImporting] = useState(false);

    const handleImport = async () => {
        try {
            setImporting(true);
            // KMZ MIME-тип на Android — application/vnd.google-earth.kmz, но не везде зарегистрирован.
            // Берём всё и фильтруем по расширению.
            const [picked] = await pick({type: ['*/*']});
            const name = (picked.name || '').toLowerCase();
            if (!name.endsWith('.kmz')) {
                Alert.alert('Не KMZ', 'Выберите файл с расширением .kmz');
                return;
            }

            // На Android picked.uri — content:// , RNFS его не всегда читает корректно.
            // Делаем локальную копию в cachesDirectory и работаем с file://.
            const [copy] = await keepLocalCopy({
                files: [{uri: picked.uri, fileName: picked.name || 'import.kmz'}],
                destination: 'cachesDirectory',
            });
            if (copy.status !== 'success') {
                throw new Error(`Не удалось скопировать файл: ${copy.copyError}`);
            }

            const layerData = await importKMZFile(copy.localUri);
            await addKMZLayer.mutateAsync(layerData);
            Alert.alert('Готово', `Слой "${layerData.name}" импортирован`);
        } catch (e: any) {
            if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
            Alert.alert('Ошибка импорта', e?.message || String(e));
        } finally {
            setImporting(false);
        }
    };

    const handleDelete = (layer: KMZLayer) => {
        Alert.alert('Удалить слой?', `"${layer.name}" будет удалён вместе с картинкой.`, [
            {text: 'Отмена', style: 'cancel'},
            {
                text: 'Удалить',
                style: 'destructive',
                onPress: async () => {
                    await deleteKMZLayer.mutateAsync(layer.id);
                    await deleteKMZImage(layer.imagePath);
                },
            },
        ]);
    };

    const toggleVisible = (layer: KMZLayer) => {
        updateKMZLayer.mutate({layerId: layer.id, updates: {visible: !layer.visible}});
    };

    const setOpacity = (layer: KMZLayer, opacity: number) => {
        updateKMZLayer.mutate({layerId: layer.id, updates: {opacity}});
    };

    return (
        <Container>
            <TopBar>
                <Text style={{color: '#aaa', fontSize: 13}}>
                    Импортируйте растровые KMZ (GroundOverlay) из мессенджеров.
                </Text>
            </TopBar>

            <GlobalToggleRow onPress={() => setShowKMZLayers.mutate(!mapSettings?.showKMZLayers)}>
                <Text style={{color: '#fff', fontSize: 15}}>Показывать KMZ-слои на карте</Text>
                <Text style={{color: mapSettings?.showKMZLayers ? '#27ae60' : '#e74c3c', fontSize: 22}}>
                    {mapSettings?.showKMZLayers ? '✓' : '✗'}
                </Text>
            </GlobalToggleRow>

            <Button
                color='secondary'
                text={importing ? 'Импорт...' : 'Импортировать KMZ'}
                onPress={importing ? () => {} : handleImport}
            />

            {layers.length === 0 ? (
                <EmptyState>
                    <EmptyText>Слоёв пока нет. Импортируйте первый KMZ.</EmptyText>
                </EmptyState>
            ) : (
                <FlatList
                    data={layers}
                    keyExtractor={(item) => item.id}
                    style={{marginTop: 16}}
                    renderItem={({item}) => (
                        <LayerCard>
                            <CardHeader>
                                <LayerName>{item.name}</LayerName>
                                <TouchableOpacity onPress={() => toggleVisible(item)}>
                                    <Text style={{color: item.visible ? '#27ae60' : '#7a7a7a', fontSize: 22}}>
                                        {item.visible ? '👁' : '🚫'}
                                    </Text>
                                </TouchableOpacity>
                            </CardHeader>

                            <LayerMeta>
                                bbox: {formatBounds(item.bounds)}
                                {item.rotation ? `\nrotation: ${item.rotation.toFixed(2)}°` : ''}
                            </LayerMeta>

                            <OpacityRow>
                                <OpacityLabel>Прозрачность</OpacityLabel>
                                {OPACITY_STEPS.map((step) => (
                                    <OpacityStep
                                        key={step}
                                        active={Math.abs(item.opacity - step) < 0.05}
                                        onPress={() => setOpacity(item, step)}
                                    >
                                        <OpacityStepText>{Math.round(step * 100)}%</OpacityStepText>
                                    </OpacityStep>
                                ))}
                            </OpacityRow>

                            <ActionsRow>
                                <View style={{flex: 1}} />
                                <ActionButton tone='danger' onPress={() => handleDelete(item)}>
                                    <ActionText>Удалить</ActionText>
                                </ActionButton>
                            </ActionsRow>
                        </LayerCard>
                    )}
                />
            )}
        </Container>
    );
};
