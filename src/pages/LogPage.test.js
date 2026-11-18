import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LogPage from './LogPage';
import { getLogs, deleteOldLogs } from '../api';
import { useAuth } from '../context/AuthContext';

jest.mock('../api', () => ({ getLogs: jest.fn(), deleteOldLogs: jest.fn() }));
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));
jest.mock('@mui/x-date-pickers/DatePicker', () => ({ DatePicker: () => null }));
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({ LocalizationProvider: ({ children }) => children }));

beforeEach(() => {
  jest.clearAllMocks();
  getLogs.mockResolvedValue({ logs: [{ _id: 'fixture', action: 'uploadFile', createdAt: '2026-11-18T09:00:00Z', user: { name: 'Örnek Kullanıcı' }, resource: 'file', resourceName: 'ornek.jpg' }], totalLogs: 1 });
});

test('readLogs kullanıcısı tüm listeyi, kayıtlı adı ve eksik IP açıklamasını görür', async () => {
  useAuth.mockReturnValue({ hasPermission: permission => permission === 'readLogs' });
  render(<LogPage />);
  expect(await screen.findByText('Örnek Kullanıcı')).toBeInTheDocument();
  expect(screen.getByText('Kaydedilmemiş')).toHaveAttribute('title', 'Bu kayıtta IP bilgisi saklanmamış.');
  expect(screen.getByText(/365 gün saklanır/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete Logs Older Than 1 Year' })).not.toBeInTheDocument();
  expect(getLogs).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
});

test('yalnız deleteLog yetkisi listeye erişim sağlamaz ve API isteği göndermez', () => {
  useAuth.mockReturnValue({ hasPermission: permission => permission === 'deleteLog' });
  render(<LogPage />);
  expect(screen.getByText(/readLogs yetkisi gerekir/)).toBeInTheDocument();
  expect(getLogs).not.toHaveBeenCalled();
});

test('deleteLog yetkisi olan kullanıcı temizliği yalnız 365 günlük sınırla başlatır', async () => {
  useAuth.mockReturnValue({ hasPermission: () => true });
  deleteOldLogs.mockResolvedValue({ deletedCount: 3 });
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
  const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
  try {
    render(<LogPage />);
    await screen.findByText('Örnek Kullanıcı');
    fireEvent.click(screen.getByRole('button', { name: 'Delete Logs Older Than 1 Year' }));
    await waitFor(() => expect(deleteOldLogs).toHaveBeenCalledWith(365));
    await waitFor(() => expect(alert).toHaveBeenCalled());
  } finally {
    confirm.mockRestore();
    alert.mockRestore();
  }
});
