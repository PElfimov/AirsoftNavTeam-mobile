import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useMapSettings} from '@src/airsoft-nav/app/hooks/useMapSettings';
import {UsersIcon} from '@src/airsoft-nav/ui/icons/UsersIcon';
import {HybridIcon} from '@src/airsoft-nav/ui/icons/HybridIcon';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';
import {SatelliteIcon} from '@src/airsoft-nav/ui/icons/SatelliteIcon';
import {SchemeIcon} from '@src/airsoft-nav/ui/icons/SchemeIcon';

const StatusBarContainer = styled.View<{topInset: number}>`
    position: absolute;
    top: ${(props) => props.topInset + 13}px;
    left: 10px;
    right: 10px;
    flex-direction: row;
    justify-content: space-between;
    background-color: rgba(44, 44, 44, 0.8);
    border-radius: 16px;
    padding-vertical: 14px;
    padding-horizontal: 40px;
    height: 52;
`;

const StatusItem = styled.View`
    flex-direction: row;
    align-items: center;
    height: 100%;
`;

const StatusText = styled.Text`
    color: ${COLORS.contrast};
    font-size: 15px;
    margin-left: 10px;
`;

interface Props {
    playerCount: number;
}

const typeOfMap = {
    standard: {name: 'Схема', icon: <HybridIcon />},
    satellite: {name: 'Спутник', icon: <SatelliteIcon />},
    hybrid: {name: 'Гибрид', icon: <SchemeIcon />},
};

export const StatusMapBar: React.FC<Props> = ({playerCount}) => {
    const insets = useSafeAreaInsets();
    const {data: mapSettings} = useMapSettings();

    return (
        <StatusBarContainer topInset={insets.top}>
            <StatusItem>
                <UsersIcon />
                <StatusText>{playerCount} игроков</StatusText>
            </StatusItem>
            <StatusItem>
                {typeOfMap[mapSettings?.mapType || 'standard'].icon}
                <StatusText>{typeOfMap[mapSettings?.mapType || 'standard'].name}</StatusText>
            </StatusItem>
        </StatusBarContainer>
    );
};
