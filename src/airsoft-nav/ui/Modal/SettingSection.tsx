import React from 'react';
import styled from 'styled-components/native';

import {COLORS} from '../constants/colors';

interface Props {
    children: React.ReactNode;
    title?: string;
    isCentredTitle?: boolean;
}

const Container = styled.View`
    margin-bottom: 20px;
`;

const Title = styled.Text<{isCentred: boolean}>`
    color: ${COLORS.inverse};
    font-size: 15px;
    margin-bottom: 15px;
    ${(props) => (props.isCentred ? 'text-align: center' : 'margin-left: 10px')};
`;

export const SettingSection: React.FC<Props> = ({children, title, isCentredTitle}) => (
    <Container>
        {!!title && <Title isCentred={isCentredTitle}>{title}</Title>}
        {children}
    </Container>
);
