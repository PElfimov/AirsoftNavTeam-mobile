import styled from 'styled-components/native';
import React from 'react';

import {COLORS, ColorType} from '@src/airsoft-nav/ui/constants/colors';
import {LayersIcon} from '@src/airsoft-nav/ui/icons/LayersIcon';
import {PlusIcon} from '../icons/PlusIcon';
import {SettingsIcon} from '../icons/SettingsIcon';

export interface IProps {
    onPress: () => void;
    iconType: IconButtonType;
    color?: ColorType;
    size?: number;
}

const iconComponents = {
    layers: LayersIcon,
    plus: PlusIcon,
    settings: SettingsIcon,
};

export type IconButtonType = keyof typeof iconComponents;

const iconColor = {
    primary: 'contrast',
    secondary: 'primary',
};

const ControlButton = styled.TouchableOpacity<{color: string; size: number}>`
    background-color: ${(props) => props.color};
    justify-content: center;
    border-radius: 16px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
    align-items: center;
    justify-content: center;
    elevation: 5;
`;

export const IconButton: React.FC<IProps> = ({onPress, iconType, color = 'primary', size = 60}) => {
    const IconComponent = iconComponents[iconType];

    return (
        <ControlButton color={COLORS[color]} size={size} onPress={onPress}>
            <IconComponent color={iconColor[color]} />
        </ControlButton>
    );
};
