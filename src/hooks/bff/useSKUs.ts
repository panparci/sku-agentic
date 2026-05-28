import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skuApi } from '../../services/api';

export function useSKUs(status?: string) {
  return useQuery({
    queryKey: ['skus', status ?? 'all'],
    queryFn: async () => {
      const res = await skuApi.list(status);
      if (!res.success) throw new Error(res.error?.message);
      return res.data ?? [];
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useSKU(id: string) {
  return useQuery({
    queryKey: ['skus', 'detail', id],
    queryFn: async () => {
      const res = await skuApi.get(id);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCriticalStock() {
  return useQuery({
    queryKey: ['skus', 'critical'],
    queryFn: async () => {
      const res = await skuApi.criticalStock();
      if (!res.success) throw new Error(res.error?.message);
      return res.data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateSKU() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: skuApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skus'] });
    },
  });
}

export function useUpdateSKU() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof skuApi.update>[1] }) =>
      skuApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['skus'] });
      qc.invalidateQueries({ queryKey: ['skus', 'detail', id] });
    },
  });
}

export function useToggleSKUStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      skuApi.toggleStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skus'] });
    },
  });
}

export function useDeleteSKU() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: skuApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skus'] });
    },
  });
}
