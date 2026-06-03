// components/UserMarker.tsx
import React from 'react';
import styled from 'styled-components/native';
import {SvgXml} from 'react-native-svg';

import {COLORS, ColorType} from '../constants/colors';

interface IProps {
    size?: number;
    color?: ColorType;
}

const getXml = (color: string) => `<svg viewBox="0 0 21 21" fill="${color}" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_593_3500)">
<path d="M20.125 9.625H11.375V0.875C11.375 0.642936 11.2828 0.420376 11.1187 0.256282C10.9546 0.0921872 10.7321 0 10.5 0C10.2679 0 10.0454 0.0921872 9.88128 0.256282C9.71719 0.420376 9.625 0.642936 9.625 0.875V9.625H0.875C0.642936 9.625 0.420376 9.71719 0.256282 9.88128C0.0921872 10.0454 0 10.2679 0 10.5C0 10.7321 0.0921872 10.9546 0.256282 11.1187C0.420376 11.2828 0.642936 11.375 0.875 11.375H9.625V20.125C9.625 20.3571 9.71719 20.5796 9.88128 20.7437C10.0454 20.9078 10.2679 21 10.5 21C10.7321 21 10.9546 20.9078 11.1187 20.7437C11.2828 20.5796 11.375 20.3571 11.375 20.125V11.375H20.125C20.3571 11.375 20.5796 11.2828 20.7437 11.1187C20.9078 10.9546 21 10.7321 21 10.5C21 10.2679 20.9078 10.0454 20.7437 9.88128C20.5796 9.71719 20.3571 9.625 20.125 9.625Z" fill=${color}/>
</g>
<defs>
<clipPath id="clip0_593_3500">
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

export const PlusIcon: React.FC<IProps> = ({size = 24, color = 'primary'}) => (
    <Container size={size}>
        <SvgXml height={size} width={size} xml={getXml(COLORS[color])} />
    </Container>
);
