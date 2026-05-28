import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prApi } from '../../services/api';

export function usePRs(status?: string, department?: string) {
  return useQuery({
    queryKey: ['prs', status ?? 'all', department ?? 'all'],
    queryFn: async () => {
      const res = await prApi.list(status, department);
      if (!res.success) throw new Error(res.error?.message);
      return res.data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

export function usePR(id: string) {
  return useQuery({
    queryKey: ['prs', 'detail', id],
    queryFn: async () => {
      const res = await prApi.get(id);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: prApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prs'] });
    },
  });
}

export function useUpdatePRStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectReason,
    }: {
      id: string;
      status: string;
      rejectReason?: string;
    }) => prApi.updateStatus(id, status, rejectReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prs'] });
    },
  });
}

export function useDeletePR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: prApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prs'] });
    },
  });
}
