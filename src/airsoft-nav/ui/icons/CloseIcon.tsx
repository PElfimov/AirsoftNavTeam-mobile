// components/UserMarker.tsx
import React from 'react';
import styled from 'styled-components/native';
import {SvgXml} from 'react-native-svg';

import {COLORS, ColorType} from '../constants/colors';

interface IProps {
    size?: number;
    color?: ColorType;
}

const getXml = (color: string) => `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.4141 11.994L23.7073 1.69559C24.0909 1.29817 24.08 0.664742 23.6827 0.280869C23.2952 -0.0936231 22.6808 -0.0936231 22.2932 0.280869L12 10.5792L1.7068 0.280869C1.30953 -0.103003 0.676466 -0.0919816 0.292787 0.305445C-0.0815172 0.693163 -0.0815172 1.30787 0.292787 1.69559L10.586 11.994L0.292787 22.2923C-0.0975956 22.6831 -0.0975956 23.3164 0.292787 23.7071C0.68331 24.0976 1.31632 24.0976 1.7068 23.7071L12 13.4087L22.2932 23.7071C22.6837 24.0976 23.3167 24.0976 23.7072 23.7071C24.0976 23.3163 24.0976 22.683 23.7072 22.2923L13.4141 11.994Z" fill="${color}"/>
</svg>`;

const Container = styled.View<{size: number}>`
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    align-items: center;
    justify-content: center;
`;

export const CloseIcon: React.FC<IProps> = ({size = 24, color = 'secondary'}) => (
    <Container size={size}>
        <SvgXml height={size} width={size} xml={getXml(COLORS[color])} />
    </Container>
);
