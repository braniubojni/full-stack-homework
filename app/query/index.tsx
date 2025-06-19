'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { FC } from 'react';

type QueryProps = { children?: React.ReactNode };

const queryClient = new QueryClient();
const Query: FC<QueryProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Query;
