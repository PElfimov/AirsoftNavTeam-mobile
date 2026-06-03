import {QueryClient, QueryClientProvider as RQProvider} from '@tanstack/react-query';
import {FC, PropsWithChildren} from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 минут
            refetchOnWindowFocus: false,
            gcTime: 5 * 60 * 1000,
        },
    },
});

export const QueryClientProvider: FC<PropsWithChildren> = ({children}) => {
    return <RQProvider client={queryClient}>{children}</RQProvider>;
};
