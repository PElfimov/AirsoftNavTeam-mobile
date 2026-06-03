// components/UserMarker.tsx
import React from 'react';
import styled from 'styled-components/native';
import {SvgXml} from 'react-native-svg';

import {COLORS, ColorType} from '../constants/colors';

interface IProps {
    size?: number;
    color?: ColorType;
}

const getXml = (color: string) => `<svg viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
<path d="M10.239 14.782C10.726 15.259 11.367 15.496 12.006 15.496C12.638 15.496 13.268 15.263 13.742 14.799L16.949 11.95C18.271 10.628 19 8.87 19 7C19 5.13 18.271 3.373 16.949 2.05C15.628 0.728 13.87 0 12 0C10.13 0 8.372 0.728 7.05 2.05C4.321 4.779 4.321 9.22 7.071 11.97L10.239 14.782ZM7.757 2.757C8.891 1.624 10.398 1 12 1C13.602 1 15.109 1.624 16.242 2.757C17.376 3.89 18 5.397 18 7C18 8.603 17.376 10.109 16.264 11.222L13.061 14.067C12.477 14.64 11.525 14.637 10.921 14.05L7.757 11.242C5.418 8.903 5.418 5.096 7.757 2.757ZM12 9.98C13.648 9.98 14.99 8.639 14.99 6.99C14.99 5.341 13.648 4 12 4C10.352 4 9.01 5.341 9.01 6.99C9.01 8.639 10.352 9.98 12 9.98ZM12 5C13.098 5 13.99 5.893 13.99 6.99C13.99 8.087 13.097 8.98 12 8.98C10.903 8.98 10.01 8.087 10.01 6.99C10.01 5.893 10.903 5 12 5ZM24 17.016C24 17.192 23.908 17.355 23.757 17.445L13.447 23.631C13.001 23.899 12.501 24.033 12 24.033C11.499 24.033 10.999 23.898 10.553 23.631L0.243 17.444C0.092 17.354 0 17.191 0 17.015C0 16.839 0.092 16.676 0.243 16.586L5.243 13.586C5.477 13.443 5.787 13.521 5.929 13.758C6.072 13.994 5.994 14.302 5.757 14.444L1.472 17.015L11.067 22.772C11.643 23.118 12.358 23.118 12.934 22.772L22.529 17.015L18.218 14.428C17.981 14.286 17.904 13.979 18.046 13.742C18.189 13.505 18.498 13.428 18.732 13.57L23.757 16.586C23.908 16.677 24 16.839 24 17.015V17.016Z" fill="${color}"/>
</svg>
`;

const Container = styled.View<{size: number}>`
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    align-items: center;
    justify-content: center;
`;

export const MapIcon: React.FC<IProps> = ({size = 24, color = 'primary'}) => (
    <Container size={size}>
        <SvgXml height={size} width={size} xml={getXml(COLORS[color])} />
    </Container>
);
