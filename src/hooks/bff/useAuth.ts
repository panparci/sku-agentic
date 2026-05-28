import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../services/api';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      if (data.success && data.data?.user) {
        queryClient.setQueryData(['me'], data.data.user);
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.me();
      if (!res.success) throw new Error(res.error?.message || 'Not authenticated');
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
