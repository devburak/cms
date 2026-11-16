import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WorkGroupsPage from './WorkGroupsPage';
import * as api from '../api';
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ hasPermission: () => true }) }));
jest.mock('../services/notificationBus', () => ({ notifyError: jest.fn(), notifySuccess: jest.fn() }));
jest.mock('../components/workGroup/WorkGroupForm', () => ({ selectedWorkGroup }) => <div>{selectedWorkGroup?.members?.[0]?.firstName} Üye</div>);
jest.mock('../components/report/ReportForm', () => () => null);
jest.mock('../components/decision/DecisionForm', () => () => null);
jest.mock('../api', () => ({ getWorkGroupFamilies: jest.fn(), getAllPeriods: jest.fn(), getChambers: jest.fn(), getWorkGroupFamily: jest.fn(), getAllContents: jest.fn(), getDecisions: jest.fn(), getReports: jest.fn() }));
test('grup altında dönem değişimi doğru üyeleri ve içerik kapsamını getirir', async () => {
  const periods = [{ _id: 'p49', name: '49. Dönem' }, { _id: 'p48', name: '48. Dönem' }];
  const family = { _id: 'energy', name: 'Enerji', periodCount: 2 };
  api.getWorkGroupFamilies.mockResolvedValue([family]); api.getAllPeriods.mockResolvedValue({ periods }); api.getChambers.mockResolvedValue({ data: [] });
  api.getWorkGroupFamily.mockImplementation(async (id, query) => {
    const period = periods.find(p => p._id === query.period) || periods[0];
    return { ...family, periods: periods.map(p => ({ _id: 'term-' + p._id, period: p })), activeTerm: { _id: 'term-' + period._id, period, members: [{ firstName: period._id === 'p49' ? 'Yeni' : 'Eski' }] } };
  });
  api.getAllContents.mockResolvedValue({ contents: [{ _id: 'article', title: 'Dönem belgesi', status: 'draft' }], totalPages: 1 });
  render(<MemoryRouter><WorkGroupsPage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Aç' }));
  await screen.findByText('Yeni Üye');
  fireEvent.change(screen.getByLabelText('Dönem'), { target: { value: 'p48' } });
  await screen.findByText('Eski Üye'); expect(screen.queryByText('Yeni Üye')).toBeNull();
  fireEvent.click(screen.getByRole('tab', { name: 'İçerikler' }));
  await screen.findByText('Dönem belgesi');
  expect(api.getAllContents).toHaveBeenLastCalledWith({ workGroupId: 'term-p48', page: 1, limit: 10 });
});
