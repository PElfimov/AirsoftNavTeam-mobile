// components/UserMarker.tsx
import React from 'react';
import styled from 'styled-components/native';
import {SvgXml} from 'react-native-svg';

import {COLORS, ColorType} from '../constants/colors';

interface IProps {
    size?: number;
    color?: ColorType;
}

const getXml = (color: string) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M20.787 12C20.787 11.378 20.716 10.74 20.576 10.101L23.574 8.251L20.423 3.145L17.425 4.996C16.624 4.349 15.74 3.851 14.787 3.515V0H8.787V3.514C7.834 3.851 6.95 4.348 6.149 4.995L3.151 3.144L0 8.251L2.998 10.101C2.858 10.741 2.787 11.378 2.787 12C2.787 12.622 2.858 13.26 2.998 13.899L0 15.749L3.151 20.855L6.149 19.004C6.95 19.651 7.834 20.149 8.787 20.485V23.999H14.787V20.485C15.74 20.148 16.624 19.651 17.425 19.004L20.423 20.855L23.574 15.749L20.576 13.899C20.716 13.259 20.787 12.622 20.787 12ZM22.198 16.075L20.097 19.478L17.328 17.77C16.36 18.681 15.189 19.353 13.787 19.755V22.999H9.787V19.755C8.509 19.424 7.326 18.772 6.246 17.77L3.477 19.478L1.376 16.075L4.145 14.366C4.145 14.366 3.787 13.436 3.787 12C3.787 10.564 4.145 9.634 4.145 9.634L1.376 7.925L3.477 4.522L6.246 6.23C7.223 5.346 8.396 4.677 9.787 4.245V1H13.787V4.244C15.063 4.568 16.241 5.237 17.328 6.229L20.097 4.521L22.198 7.924L19.429 9.633C19.429 9.633 19.787 10.589 19.787 11.999C19.787 13.409 19.429 14.365 19.429 14.365L22.198 16.074V16.075ZM11.787 8C9.581 8 7.787 9.794 7.787 12C7.787 14.206 9.581 16 11.787 16C13.993 16 15.787 14.206 15.787 12C15.787 9.794 13.993 8 11.787 8ZM11.787 15C10.133 15 8.787 13.654 8.787 12C8.787 10.346 10.133 9 11.787 9C13.441 9 14.787 10.346 14.787 12C14.787 13.654 13.441 15 11.787 15Z" fill="${color}"/>
</svg>
`;

const Container = styled.View<{size: number}>`
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    align-items: center;
    justify-content: center;
`;

export const SettingsIcon: React.FC<IProps> = ({size = 24, color = 'primary'}) => (
    <Container size={size}>
        <SvgXml height={size} width={size} xml={getXml(COLORS[color])} />
    </Container>
);
