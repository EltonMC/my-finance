import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { removePrivateQueries } from '@/lib/query-client';
import { loadSession } from '../api/load-session';
import { watchSession } from '../api/watch-session';

export function useSession(enabled: boolean) {
  const queryClient = useQueryClient();
  const currentUserId = useRef<string | null | undefined>(undefined);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(
    () =>
      watchSession((userId) => {
        if (userId === null || (currentUserId.current !== undefined && currentUserId.current !== userId)) {
          removePrivateQueries(queryClient);
        }
        currentUserId.current = userId;
        setUserId(userId);
        queryClient.setQueryData(['auth', 'session'], userId !== null);
      }),
    [queryClient],
  );
  const query = useQuery({ queryKey: ['auth', 'session'], queryFn: loadSession, enabled, retry: false });
  return { ...query, userId };
}
