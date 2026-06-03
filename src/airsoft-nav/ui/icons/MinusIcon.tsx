// components/UserMarker.tsx
import React from 'react';
import styled from 'styled-components/native';
import {SvgXml} from 'react-native-svg';

import {COLORS, ColorType} from '../constants/colors';

interface IProps {
    size?: number;
    color?: ColorType;
}

const getXml = (color: string) => `<svg viewBox="0 0 21 2" fill="${color}" xmlns="http://www.w3.org/2000/svg">
<rect width="21" height="2" rx="1" fill="black"/>
</svg>


`;

const Container = styled.View<{size: number}>`
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    align-items: center;
    justify-content: center;
`;

export const MinusIcon: React.FC<IProps> = ({size = 24, color = 'primary'}) => (
    <Container size={size}>
        <SvgXml height={size} width={size} xml={getXml(COLORS[color])} />
    </Container>
);
