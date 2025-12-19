import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ApiProvider } from './context/ApiProvider';
import { UserProvider } from './context/UserProvider';
import { CommonLayout } from './component/CommonLayout';
import { Dashboard } from './component/Dashboard';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: '1', login: 'test' }),
    })
  ) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders dashboard when authenticated', async () => {
  render(
    <ApiProvider>
      <UserProvider>
        <MemoryRouter initialEntries={['/']}>
          <CommonLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </CommonLayout>
        </MemoryRouter>
      </UserProvider>
    </ApiProvider>
  );
  await waitFor(() => {
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});
