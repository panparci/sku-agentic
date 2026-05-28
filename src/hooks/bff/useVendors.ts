import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../../services/api';

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await vendorApi.list();
      if (!res.success) throw new Error(res.error?.message);
      return res.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: async () => {
      const res = await vendorApi.get(id);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vendorApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof vendorApi.update>[1] }) =>
      vendorApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      qc.invalidateQueries({ queryKey: ['vendors', id] });
    },
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vendorApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
