// components/UserMarker.tsx
import React from 'react';
import styled from 'styled-components/native';
import {SvgXml} from 'react-native-svg';

import {COLORS, ColorType} from '../constants/colors';

interface IProps {
    size?: number;
    color?: ColorType;
}

const getXml = (color: string) => `
<svg width="21" height="21" viewBox="0 0 21 21" fill="${color}" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_593_3505)">
<path d="M10.5 6.125C12.9124 6.125 14.875 8.08763 14.875 10.5C14.875 12.9124 12.9124 14.875 10.5 14.875C8.08763 14.875 6.125 12.9124 6.125 10.5C6.125 8.08763 8.08763 6.125 10.5 6.125ZM10.5 13.125C11.9473 13.125 13.125 11.9473 13.125 10.5C13.125 9.05275 11.9473 7.875 10.5 7.875C9.05275 7.875 7.875 9.05275 7.875 10.5C7.875 11.9473 9.05275 13.125 10.5 13.125ZM0.875 9.625H1.79375C2.20587 5.49762 5.49763 2.205 9.625 1.79375V0.875C9.625 0.391125 10.017 0 10.5 0C10.983 0 11.375 0.391125 11.375 0.875V1.79375C15.5024 2.205 18.795 5.49762 19.2063 9.625H20.125C20.608 9.625 21 10.0161 21 10.5C21 10.9839 20.608 11.375 20.125 11.375H19.2063C18.7941 15.5024 15.5024 18.795 11.375 19.2063V20.125C11.375 20.6089 10.983 21 10.5 21C10.017 21 9.625 20.6089 9.625 20.125V19.2063C5.49763 18.7941 2.205 15.5024 1.79375 11.375H0.875C0.392 11.375 0 10.9839 0 10.5C0 10.0161 0.392 9.625 0.875 9.625ZM10.5 17.5C14.3596 17.5 17.5 14.3596 17.5 10.5C17.5 6.64038 14.3596 3.5 10.5 3.5C6.64038 3.5 3.5 6.64038 3.5 10.5C3.5 14.3596 6.64038 17.5 10.5 17.5Z" fill="black"/>
</g>
<defs>
<clipPath id="clip0_593_3505">
<rect width="21" height="21" fill="white" transform="matrix(-1 0 0 1 21 0)"/>
</clipPath>
</defs>
</svg>
`;

const Container = styled.View<{size: number}>`
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    align-items: center;
    justify-content: center;
`;

export const LocationIcon: React.FC<IProps> = ({size = 24, color = 'primary'}) => (
    <Container size={size}>
        <SvgXml height={size} width={size} xml={getXml(COLORS[color])} />
    </Container>
);
