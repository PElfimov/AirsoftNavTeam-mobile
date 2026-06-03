import styled from 'styled-components/native';
import {TouchableOpacity, View} from 'react-native';
import MapView, {Region} from 'react-native-maps';

import {MinusIcon} from '@src/airsoft-nav/ui/icons/MinusIcon';
import {PlusIcon} from '@src/airsoft-nav/ui/icons/PlusIcon';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';

const ZOOM_FACTOR = 2; // Коэффициент масштабирования

const Controls = styled(View)`
    align-items: center;
    background-color: ${COLORS.contrast};
    border-radius: 16px;
`;

const Button = styled(TouchableOpacity)`
    background-color: ${COLORS.contrast};
    border-radius: 16px;
    height: 60px;
    width: 60px;
    align-items: center;
    justify-content: center;
`;

interface Props {
    mapRef: React.RefObject<MapView>;
    region: Region;
    setRegion: (region: Region) => void;
}
export const ZoomControls: React.FC<Props> = ({mapRef, region, setRegion}) => {
    const handleZoomIn = () => {
        const newRegion = {
            ...region,
            latitudeDelta: region.latitudeDelta / ZOOM_FACTOR,
            longitudeDelta: region.longitudeDelta / ZOOM_FACTOR,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 300);
    };

    // Уменьшение масштаба (отдаление)
    const handleZoomOut = () => {
        const newRegion = {
            ...region,
            latitudeDelta: region.latitudeDelta * ZOOM_FACTOR,
            longitudeDelta: region.longitudeDelta * ZOOM_FACTOR,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 300);
    };
    return (
        <Controls>
            <Button onPress={handleZoomIn}>
                <PlusIcon />
            </Button>
            <Button onPress={handleZoomOut}>
                <MinusIcon />
            </Button>
        </Controls>
    );
};
