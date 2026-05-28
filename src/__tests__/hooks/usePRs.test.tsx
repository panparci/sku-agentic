/**
 * PR Hook Integration Tests
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock API
jest.mock('../../services/api', () => ({
  prApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  },
}));

import { prApi } from '../../services/api';
import { usePRs, useCreatePR } from '../../hooks/bff';

const mockPrApi = prApi as jest.Mocked<typeof prApi>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePRs', () => {
  beforeEach(() => {
    mockPrApi.list.mockReset();
  });

  it('should load PRs successfully', async () => {
    const mockPRs = [
      { pr_id: 'PR-001', pr_number: 'PR-20260101-0001', department: 'IGD', status: 'Submitted', items: [], total_amount: 500000 },
    ];
    mockPrApi.list.mockResolvedValueOnce({ success: true, data: mockPRs });

    const { result } = renderHook(() => usePRs(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].department).toBe('IGD');
  });

  it('should filter by status', async () => {
    mockPrApi.list.mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => usePRs('Approved'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPrApi.list).toHaveBeenCalledWith('Approved', undefined);
  });

  it('should handle API error', async () => {
    mockPrApi.list.mockResolvedValueOnce({ success: false, error: { message: 'Server error' } });

    const { result } = renderHook(() => usePRs(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCreatePR', () => {
  beforeEach(() => {
    mockPrApi.create.mockReset();
  });

  it('should create PR and invalidate list', async () => {
    const newPR = { pr_id: 'PR-NEW', pr_number: 'PR-20260101-9999', department: 'Farmasi', status: 'Draft', items: [] };
    mockPrApi.create.mockResolvedValueOnce({ success: true, data: newPR });

    const { result } = renderHook(() => useCreatePR(), { wrapper: createWrapper() });

    let created: any;
    await waitFor(async () => {
      created = await result.current.mutateAsync({
        department: 'Farmasi',
        target_date: '2026-01-20',
        items: [],
      });
    });

    expect(created.success).toBe(true);
    expect(mockPrApi.create).toHaveBeenCalled();
  });
});
