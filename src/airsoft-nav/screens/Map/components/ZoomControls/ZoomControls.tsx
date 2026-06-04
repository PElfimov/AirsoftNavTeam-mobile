import React from 'react';
import styled from 'styled-components/native';
import {TouchableOpacity, View} from 'react-native';
import type {CameraRef} from '@maplibre/maplibre-react-native';

import {MinusIcon} from '@src/airsoft-nav/ui/icons/MinusIcon';
import {PlusIcon} from '@src/airsoft-nav/ui/icons/PlusIcon';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';

const ZOOM_STEP = 1;
const MIN_ZOOM = 2;
const MAX_ZOOM = 18;

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
    cameraRef: React.RefObject<CameraRef | null>;
    zoom: number;
    setZoom: (zoom: number) => void;
}

const clamp = (value: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));

export const ZoomControls: React.FC<Props> = ({cameraRef, zoom, setZoom}) => {
    const handleZoomIn = () => {
        const next = clamp(zoom + ZOOM_STEP);
        setZoom(next);
        cameraRef.current?.zoomTo(next, 300);
    };

    const handleZoomOut = () => {
        const next = clamp(zoom - ZOOM_STEP);
        setZoom(next);
        cameraRef.current?.zoomTo(next, 300);
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
