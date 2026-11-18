import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import WorkGroupForm from './WorkGroupForm';
import userEvent from '@testing-library/user-event';
const chamber = { _id: '000000000000000000000001', name: 'BİLGİSAYAR MÜHENDİSLERİ ODASI', short: 'BMO' };
const period = { _id: 'p49', name: '49. Dönem' };
const group = affiliation => ({ _id: 'group', name: 'Enerji', slug: 'enerji', period, members: [{ firstName: 'Örnek', lastName: 'Üye', unit: 'Özgün birim', chamber: affiliation }] });
test('TMMOB is selectable as Birlik, while other choices come from Chambers', async () => {
  const onSave = jest.fn().mockResolvedValue(undefined);
  render(<WorkGroupForm selectedWorkGroup={group('TMMOB')} periods={[period]} chambers={[chamber]} onSave={onSave} />);
  const input = screen.getByRole('combobox', { name: 'Kurum / Oda' });
  expect(input).toHaveValue('TMMOB (Birlik)');
  userEvent.click(input);
  userEvent.clear(input);
  userEvent.type(input, 'BMO');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('option', { name: /BMO - BİLGİSAYAR/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Dönem üyelerini ve bilgilerini kaydet' }));
  await waitFor(() => expect(onSave).toHaveBeenCalled());
  expect(onSave.mock.calls[0][0].members[0].chamber).toEqual({ kind: 'chamber', chamberId: chamber._id, name: chamber.name, short: chamber.short });
  expect(onSave.mock.calls[0][0].members[0].unit).toBe('Özgün birim');
});
test('TMMOB submits without an invented Chamber id', async () => {
  const onSave = jest.fn().mockResolvedValue(undefined);
  render(<WorkGroupForm selectedWorkGroup={group({ kind: 'tmmob', chamberId: null, name: 'TMMOB', short: 'TMMOB' })} periods={[period]} chambers={[chamber]} onSave={onSave} />);
  fireEvent.click(screen.getByRole('button', { name: 'Dönem üyelerini ve bilgilerini kaydet' }));
  await waitFor(() => expect(onSave).toHaveBeenCalled());
  expect(onSave.mock.calls[0][0].members[0].chamber).toEqual({ kind: 'tmmob', chamberId: null, name: 'TMMOB', short: 'TMMOB' });
});
