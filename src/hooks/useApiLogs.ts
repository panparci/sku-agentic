/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { MAX_API_LOGS } from '../constants/options';
import { formatTimeID, randomShortId } from '../utils/format';

export type ApiLogMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiLog {
  id: string;
  timestamp: string;
  method: ApiLogMethod;
  endpoint: string;
  payload?: unknown;
  response: unknown;
}

export interface UseApiLogsResult {
  logs: ApiLog[];
  addLog: (
    method: ApiLogMethod,
    endpoint: string,
    payload: unknown,
    response: unknown
  ) => void;
  clearLogs: () => void;
}

export const useApiLogs = (): UseApiLogsResult => {
  const [logs, setLogs] = useState<ApiLog[]>([]);

  const addLog = useCallback<UseApiLogsResult['addLog']>(
    (method, endpoint, payload, response) => {
      setLogs(prev => [
        {
          id: randomShortId(),
          timestamp: formatTimeID(),
          method,
          endpoint,
          payload,
          response,
        },
        ...prev.slice(0, MAX_API_LOGS - 1),
      ]);
    },
    []
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, addLog, clearLogs };
};
