import '@testing-library/jest-dom';

// Set VITE_API_URL for api.ts
process.env.VITE_API_URL = 'http://localhost:8080/api/v1';

// Mock fetch globally
global.fetch = jest.fn();

// Mock React Router
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children }: any) => children,
  useLocation: () => ({ pathname: '/' }),
}));
